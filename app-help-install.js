(function (global) {
    'use strict';

    function normalisePublicSiteUrl(value) {
        try {
            const url = new URL(String(value || '').trim());
            const isLocalhost = url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname);
            if (url.protocol !== 'https:' && !isLocalhost) return '';
            url.hash = '';
            url.search = '';
            return url.href.replace(/\/+$/, '') + '/';
        } catch (_) {
            return '';
        }
    }

    function detectInstallPlatform(userAgent, maxTouchPoints) {
        const agent = String(userAgent || '').toLowerCase();
        if (/iphone|ipad|ipod/.test(agent) || (/macintosh/.test(agent) && Number(maxTouchPoints) > 1)) return 'ios';
        if (/android/.test(agent)) return 'android';
        return 'desktop';
    }

    function isStandalone(mediaStandalone, navigatorStandalone) {
        return Boolean(mediaStandalone || navigatorStandalone);
    }

    global.TallyoPublicIntegration = Object.freeze({
        normalisePublicSiteUrl,
        detectInstallPlatform,
        isStandalone
    });
})(window);
