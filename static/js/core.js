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

$(function() {
    var bucket;
    var bucket_match = location.hash.match(/#\/(\w+)/);

    if (bucket_match) {
        bucket = bucket_match[1];
    } else {
        bucket = random_string(BUCKET_LEN);
        location.hash = '#/' + bucket;
    }

    $('#share').html('Share this address to collaborate: <a href="'+ location.href +'">'+ location.href +'</a>');

    var fbase = new Firebase(FIREBASE_API + '/' + bucket);

    $('#domain-query').submit(function() {
        var q = clean_domain($('#query', this).val());

        fbase.child('history').push().set(q);

        $.getJSON(SEARCH_API, {'q': q}, function(data) {
            var ul = $('#result').empty();
            var results = data['results'];

            for (var i in results) {
                var r = results[i];
                if (r['availability'] == 'tld') continue;

                var domain = r['domain'];
                var c = r['availability'] == 'available' && 'available' || 'not-available';
                ul.append('<li class="'+ c +'" data-domain="' + domain + '">' + domain + '</li>');
            }
        });

        return false;
    });

    $('#result').on('click', 'li.available', function() {
        var domain = $(this).attr('data-domain');
        fbase.child('best').push().set(domain);
    });

    fbase.child('history').limit(10).on('child_added', function(data) {
        $('#history').prepend('<li>' + data.val() + '</li>');
    });

    fbase.child('best').on('child_added', function(data) {
        var li = $('<li>' + data.val() + '</li>').click(function() {
            data.ref().remove();
            $(this).remove();
        });
        $('#best').prepend(li);
    });

});
