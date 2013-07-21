var SEARCH_API = 'http://hood.instantdomainsearch.com/services/quick?callback=?';
var TLDS = ['biz', 'co', 'com', 'mobi', 'net', 'org'];

function clean_domain(q) {
    return q.split('.', 1)[0];
}

$(function() {


    $('#domain-query').submit(function() {
        var q = clean_domain($('#query', this).val());

        $.getJSON(SEARCH_API, {'name': q}, function(data) {
            var ul = $('#result').empty();

            for (var i in TLDS) {
                var tld = TLDS[i];
                var c = 'available';
                if (data['tlds'].indexOf(tld) >= 0) {
                    c = 'not-available';
                }
                ul.append('<li class="'+ c +'">' + q + '.' + tld + '</li>');
            }
        });

        return false;
    });

});
