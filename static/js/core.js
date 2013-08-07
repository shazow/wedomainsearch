var SEARCH_API = 'http://domai.nr/api/json/search?callback=?';

var FIREBASE_API = 'https://wedomainsearch.firebaseio.com';
var BUCKET_LEN = 8;

function random_string(num, alphabet) {
    alphabet = alphabet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var r = '';

    for (var i=num; i > 0; i--) {
        r += alphabet[~~(Math.random() * alphabet.length)];
    }

    return r;
};

function clean_domain(q) {
    return q.split('.', 1)[0];
};

function buy_link(domain) {
    var href = 'http://domai.nr/'+ domain +'/register';

    return $('<a target="_blank" href="'+ href +'">' + domain + '</a>').click(function() {
        ga('send', 'event', 'domain', 'shop');
    });
}

$(function() {
    var bucket;
    var bucket_match = location.hash.match(/#\/(\w+)/);

    if (bucket_match) {
        bucket = bucket_match[1];
    } else {
        bucket = random_string(BUCKET_LEN);
        location.hash = '#/' + bucket;
    }

    $('#domain-query input:first').focus();

    $('span.share-link').html('<a class="share-link" href="'+ location.href +'">'+ location.href +'</a>');
    $('a.share-link').attr('href', location.href);

    var fbase = new Firebase(FIREBASE_API + '/' + bucket);

    $('#domain-query').submit(function() {
        var q = clean_domain($('#query', this).addClass('loading').val());

        fbase.child('history').push().set(q);

        $.getJSON(SEARCH_API, {'q': q}, function(data) {
            var ul = $('#result').empty();
            var results = data['results'];

            for (var i in results) {
                var r = results[i];
                if (r['availability'] == 'tld') continue;

                var domain = r['domain'];

                if (r['availability'] != 'available') {
                    ul.append('<li class="not-available">' + domain + '</li>');
                    continue;
                }

                var li = $('<li class="available" data-domain="'+ domain +'"></li>').append(buy_link(domain));

                $('<div class="control save"><span></span></div>').click(function() {
                    var domain = $(this).parent().addClass('active').attr('data-domain');
                    fbase.child('best').push().set(domain);

                    ga('send', 'event', 'domain', 'star');
                }).prependTo(li);

                ul.append(li);
            }

            $('#query').removeClass('loading');
        });

        ga('send', 'event', 'domain', 'search');
        return false;
    });

    fbase.child('history').limit(60).on('child_added', function(data) {
        $('#history').prepend('<li>' + data.val() + '</li>').parent().fadeIn();
    });

    fbase.child('best').on('child_added', function(data) {
        var domain = data.val();
        var li = $('<li class="available"></li>').append(buy_link(domain));
        $('<div class="control saved"><span></span></div>').click(function() {
            data.ref().remove();
            $(this).parent().remove();
        }).prependTo(li);
        $('#best').prepend(li);
    });

});
