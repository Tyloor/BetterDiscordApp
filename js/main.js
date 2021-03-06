
/* BetterDiscordApp Core JavaScript
 * Version: 1.78
 * Author: Jiiks | http://jiiks.net
 * Date: 27/08/2015 - 16:36
 * Last Update: 01/05/2016
 * https://github.com/Jiiks/BetterDiscordApp
 */

/*Localstorage fix*/
(function() {

    let __fs = window.require("fs");
    let __process = window.require("process");
    let __platform = __process.platform;
    let __dataPath = (__platform === 'win32' ? __process.env.APPDATA : __platform === 'darwin' ? __process.env.HOME + '/Library/Preferences' : process.env.HOME + '/.config') + '/BetterDiscord/';


    let __data = {};
    if(__fs.existsSync(`${__dataPath}localStorage.json`)) {
        try {
            __data = JSON.parse(__fs.readFileSync(`${__dataPath}localStorage.json`))
        }catch(err) {
            console.log(err);
        }
    } else if(__fs.existsSync("localStorage.json")) {
        try {
            __data = JSON.parse(__fs.readFileSync("localStorage.json"));
        }catch(err) {
            console.log(err);
        }
    }

    var __ls = __data;
    __ls.setItem = function(i, v) { 
        __ls[i] = v;
        this.save();
    };
    __ls.getItem = function(i) {
        return __ls[i] || null;
    };
    __ls.save = function() {
        __fs.writeFileSync(`${__dataPath}/localStorage.json`, JSON.stringify(this), null, 4);
    };

    var __proxy = new Proxy(__ls, {
        set: function(target, name, val, receiver) {
            __ls[name] = val;
            __ls.save();
        },
        get: function(target, name, receiver) {
            return __ls[name] || null;
        }
    });

    window.localStorage = __proxy;

})();

(() => {
    let v2Loader = document.createElement('div');
    v2Loader.className = "bd-loaderv2";
    v2Loader.title = "BetterDiscord is loading...";
    document.body.appendChild(v2Loader);
})();

window.bdStorage = {};
window.bdStorage.get = function(i) {
    return betterDiscordIPC.sendSync('synchronous-message', { 'arg': 'storage', 'cmd': 'get', 'var': i });
};
window.bdStorage.set = function(i, v) {
    betterDiscordIPC.sendSync('synchronous-message', { 'arg': 'storage', 'cmd': 'set', 'var': i, 'data': v });
};
window.bdPluginStorage = {};
window.bdPluginStorage.get = function(pn, i) {
    return betterDiscordIPC.sendSync('synchronous-message', { 'arg': 'pluginstorage', 'cmd': 'get', 'pn': pn, 'var': i });
};
window.bdPluginStorage.set = function(pn, i, v) {
    betterDiscordIPC.sendSync('synchronous-message', { 'arg': 'pluginstorage', 'cmd': 'set', 'pn': pn, 'var': i, 'data': v });
};

betterDiscordIPC.on('asynchronous-reply', (event, arg) => {
    console.log(event);
    console.log(arg);
});

var settingsPanel, emoteModule, utils, quickEmoteMenu, opublicServers, voiceMode, pluginModule, themeModule, customCssEditor, dMode;
var jsVersion = 1.79;
var supportedVersion = "0.2.81";

var mainObserver;

var twitchEmoteUrlStart = "https://static-cdn.jtvnw.net/emoticons/v1/";
var twitchEmoteUrlEnd = "/1.0";
var ffzEmoteUrlStart = "https://cdn.frankerfacez.com/emoticon/";
var ffzEmoteUrlEnd = "/1";
var bttvEmoteUrlStart = "https://cdn.betterttv.net/emote/";
var bttvEmoteUrlEnd = "/1x";

var mainCore;

var settings = {
    "Save logs locally":          { "id": "bda-gs-0",  "info": "Saves chat logs locally",                           "implemented": false, "hidden": false, "cat": "core"},
    "Public Servers":             { "id": "bda-gs-1",  "info": "Display public servers button",                     "implemented": true,  "hidden": false, "cat": "core"},
    "Minimal Mode":               { "id": "bda-gs-2",  "info": "Hide elements and reduce the size of elements.",    "implemented": true,  "hidden": false, "cat": "core"},
    "Voice Mode":                 { "id": "bda-gs-4",  "info": "Only show voice chat",                              "implemented": true,  "hidden": false, "cat": "core"},
    "Hide Channels":              { "id": "bda-gs-3",  "info": "Hide channels in minimal mode",                     "implemented": true,  "hidden": false, "cat": "core"},
    "Dark Mode":                  { "id": "bda-gs-5",  "info": "Make certain elements dark by default(wip)",        "implemented": true,  "hidden": false, "cat": "core"},
    "Override Default Emotes":    { "id": "bda-es-5",  "info": "Override default emotes",                           "implemented": false, "hidden": false, "cat": "core"},
    "Voice Disconnect":           { "id": "bda-dc-0",  "info": "Disconnect from voice server when closing Discord", "implemented": true,  "hidden": false, "cat": "core"},
    "Custom css live update":     { "id": "bda-css-0", "info": "",                                                  "implemented": true,  "hidden": true,  "cat": "core"},
    "Custom css auto udpate":     { "id": "bda-css-1", "info": "",                                                  "implemented": true,  "hidden": true,  "cat": "core"},
    "24 Hour Timestamps":         { "id": "bda-gs-6",  "info": "Replace 12hr timestamps with proper ones",          "implemented": true,  "hidden": false, "cat": "core"},
    "Coloured Text":              { "id": "bda-gs-7",  "info": "Make text colour the same as role colour",          "implemented": true,  "hidden": false, "cat": "core"},
    "BetterDiscord Blue":         { "id": "bda-gs-b",  "info": "Replace Discord blue with BD Blue",                 "implemented": true,  "hidden": false, "cat": "core"},
    "Developer Mode":             { "id": "bda-gs-8",  "info": "Developer Mode",                                    "implemented": true,  "hidden": false, "cat": "core"},

    "Twitch Emotes":              { "id": "bda-es-7",  "info": "Show Twitch emotes",                                "implemented": true,  "hidden": false, "cat": "emote"},
    "FrankerFaceZ Emotes":        { "id": "bda-es-1",  "info": "Show FrankerFaceZ Emotes",                          "implemented": true,  "hidden": false, "cat": "emote"},
    "BetterTTV Emotes":           { "id": "bda-es-2",  "info": "Show BetterTTV Emotes",                             "implemented": true,  "hidden": false, "cat": "emote"},
    "Emote Menu":                 { "id": "bda-es-0",  "info": "Show Twitch/Favourite emotes in emote menu",        "implemented": true,  "hidden": false, "cat": "emote"},
    "Emoji Menu":                 { "id": "bda-es-9",  "info": "Show Discord emoji menu",                           "implemented": true,  "hidden": false, "cat": "emote"},
    "Emote Autocomplete":         { "id": "bda-es-3",  "info": "Autocomplete emote commands",                       "implemented": false, "hidden": false, "cat": "emote"},
    "Emote Auto Capitalization":  { "id": "bda-es-4",  "info": "Autocapitalize emote commands",                     "implemented": true,  "hidden": false, "cat": "emote"},
    "Show Names":                 { "id": "bda-es-6",  "info": "Show emote names on hover",                         "implemented": true,  "hidden": false, "cat": "emote"},
    "Show emote modifiers":       { "id": "bda-es-8",  "info": "Enable emote mods",                                 "implemented": true,  "hidden": false, "cat": "emote"},
};

var links = {
    "Jiiks.net": { "text": "Jiiks.net", "href": "thtp://jiiks.net",          "target": "_blank" },
    "twitter":   { "text": "Twitter",   "href": "http://twitter.com/jiiksi", "target": "_blank" },
    "github":    { "text": "Github",    "href": "http://github.com/jiiks",   "target": "_blank" }
};

var defaultCookie = {
    "version": jsVersion,
    "bda-gs-0": false,
    "bda-gs-1": true,
    "bda-gs-2": false,
    "bda-gs-3": false,
    "bda-gs-4": false,
    "bda-gs-5": true,
    "bda-gs-6": false,
    "bda-gs-7": false,
    "bda-gs-8": false,
    "bda-es-0": true,
    "bda-es-1": true,
    "bda-es-2": true,
    "bda-es-3": false,
    "bda-es-4": false,
    "bda-es-5": true,
    "bda-es-6": true,
    "bda-es-7": true,
    "bda-gs-b": true,
    "bda-es-8": true,
    "bda-jd": true,
    "bda-es-8": true,
    "bda-dc-0": false,
    "bda-css-0": false,
    "bda-css-1": false,
    "bda-es-9": true
};

var bdchangelog = {
    "changes": {
        "0a": {
            "title": "1.78 : Temp support for new settingspanel",
            "text": "Added temp support for Discord's new settingspanel until v2.",
            "img": ""
        },
        "0b": {
            "title": "1.78 : Public Servers",
            "text": "New look and flow for public servers",
            "img": ""
        },
        "0c": {
            "title": "1.78 : New loading icon",
            "text": "New loading icon will now display in bottom right when BD is loading.",
            "img": ""
        },
        "0d": {
            "title": "1.78 : New CustomCSS editor look",
            "text": "Updated CustomCSS editor with dark theme",
            "img": ""
        },
        "0e": {
            "title": "1.78 : BetterDiscord Blue",
            "text": "Replace Discord blue with BetterDiscord blue!",
            "img": ""
        }
    },
    "fixes": {
        "0a": {
            "title": "1.79 : Settings Saving",
            "text": "Fixed settings not saving with new settings panel",
            "img": ""
        }
    }
};

var settingsCookie = {};

function Core() {}

Core.prototype.init = function () {
    var self = this;

    var lVersion = (typeof(version) === "undefined") ? bdVersion : version;

    if (lVersion < supportedVersion) {
        this.alert("Not Supported", "BetterDiscord v" + lVersion + "(your version)" + " is not supported by the latest js(" + jsVersion + ").<br><br> Please download the latest version from <a href='https://betterdiscord.net' target='_blank'>BetterDiscord.net</a>");
        return;
    }

    utils = new Utils();
    var sock = new BdWSocket();
    sock.start();
    utils.getHash();
    emoteModule = new EmoteModule();
    quickEmoteMenu = new QuickEmoteMenu();
    voiceMode = new VoiceMode();
    dMode = new devMode();

    emoteModule.init();

    this.initSettings();
    this.initObserver();

    //Incase were too fast
    function gwDefer() {
        console.log(new Date().getTime() + " Defer");
        if ($(".guilds-wrapper .guilds").children().length > 0) {
            console.log(new Date().getTime() + " Defer Loaded");
            var guilds = $(".guilds>li:first-child");

            var showChannelsButton = $("<button/>", {
                class: "btn",
                id: "bd-show-channels",
                text: "R",
                css: {
                    "cursor": "pointer"
                },
                click: function () {
                    settingsCookie["bda-gs-3"] = false;
                    $("body").removeClass("bd-minimal-chan");
                    self.saveSettings();
                }
            });

            $(".guilds-wrapper").prepend(showChannelsButton);

            opublicServers = new PublicServers();
            customCssEditor = new CustomCssEditor();
            pluginModule = new PluginModule();
            pluginModule.loadPlugins();
            if (typeof (themesupport2) !== "undefined") {
                themeModule = new ThemeModule();
                themeModule.loadThemes();
            }

            settingsPanel = new SettingsPanel();
            settingsPanel.init();

            quickEmoteMenu.init(false);

            $("#tc-settings-button").on("click", function () {
                settingsPanel.show();
            });
            
            window.addEventListener("beforeunload", function(){
                if(settingsCookie["bda-dc-0"]){
                    $('.btn.btn-disconnect').click();
                }
            });

            $(document).on("mousedown", function(e) {
                //bd modal hiders

            });
            
            opublicServers.init();

            emoteModule.autoCapitalize();

            /*Display new features in BetterDiscord*/
            if (settingsCookie["version"] < jsVersion) {
                var cl = self.constructChangelog();
                $("body").append(cl);
                settingsCookie["version"] = jsVersion;
                self.saveSettings();
            }

            $("head").append("<style>.CodeMirror{ min-width:100%; }</style>");
            $("head").append('<style id="bdemotemenustyle"></style>');
            document.getElementsByClassName("bd-loaderv2")[0].remove();
        } else {
            setTimeout(gwDefer, 100);
        }
    }


    $(document).ready(function () {
        setTimeout(gwDefer, 1000);
    });
};

Core.prototype.initSettings = function () {
    if ($.cookie("better-discord") == undefined) {
        settingsCookie = defaultCookie;
        this.saveSettings();
    } else {
        this.loadSettings();

        for (var setting in defaultCookie) {
            if (settingsCookie[setting] == undefined) {
                settingsCookie[setting] = defaultCookie[setting];
                this.saveSettings();
            }
        }
    }
};

Core.prototype.saveSettings = function () {
    $.cookie("better-discord", JSON.stringify(settingsCookie), {
        expires: 365,
        path: '/'
    });
};

Core.prototype.loadSettings = function () {
    settingsCookie = JSON.parse($.cookie("better-discord"));
};

var botlist = ["119598467310944259"]; //Temp
Core.prototype.initObserver = function () {
    mainObserver = new MutationObserver(function (mutations) {

        mutations.forEach(function (mutation) {
            if(settingsPanel !== undefined)
                settingsPanel.inject(mutation);

            if($(mutation.target).find(".emoji-picker").length) {
                var fc = mutation.target.firstChild;
                if(fc.classList.contains("popout")) {
                    quickEmoteMenu.obsCallback($(fc));
                }
            }
            if (typeof pluginModule !== "undefined") pluginModule.rawObserver(mutation);
            if (mutation.target.getAttribute('class') != null) {
                //console.log(mutation.target)
                if(mutation.target.classList.contains('title-wrap') || mutation.target.classList.contains('chat')){
                   // quickEmoteMenu.obsCallback();
                    voiceMode.obsCallback();
                    if (typeof pluginModule !== "undefined") pluginModule.channelSwitch();
                }
                if (mutation.target.getAttribute('class').indexOf('scroller messages') != -1) {
                    if (typeof pluginModule !== "undefined") pluginModule.newMessage();
                }

                if(settingsCookie["bda-gs-6"]) {
                    $(".timestamp").not("[data-24]").each(function() {
                        var t = $(this);
                        t.attr("data-24", true);
                        var text = t.text();
                        var matches = /(.*)?at\s+(\d{1,2}):(\d{1,2})\s+(.*)/.exec(text);
                        if(matches == null) return true;
                        if(matches.length < 5) return true;
                        
                        var h = parseInt(matches[2]);
                        if(matches[4] == "AM") {
                            if(h == 12) h -= 12;
                        }else if(matches[4] == "PM") {
                            if(h < 12) h += 12;
                        }
                    
                        matches[2] = ('0' + h).slice(-2);
                        t.text(matches[1] + " at " + matches[2] + ":" + matches[3]);
                    });
                }
                if(settingsCookie["bda-gs-7"]) {
                    $(".user-name").not("[data-colour]").each(function() {
                        var t = $(this);
                        var color = t.css("color");
                        if(color == "rgb(255, 255, 255)") return true;
                        t.closest(".message-group").find(".markup").not("[data-colour]").each(function() {
                            $(this).attr("data-colour", true);
                            $(this).css("color", color);
                        });
                    });
                }
            }
            emoteModule.obsCallback(mutation);
        });
    });

    //noinspection JSCheckFunctionSignatures
    mainObserver.observe(document, {
        childList: true,
        subtree: true
    });
};

Core.prototype.constructChangelog = function () {
    var changeLog = '' +
        '<div id="bd-wn-modal" class="modal" style="opacity:1;">' +
        '  <div class="modal-inner">' +
        '       <div id="bdcl" class="markdown-modal change-log"> ' +
        '           <div class="markdown-modal-header">' +
        '               <strong>What\'s new in BetterDiscord JS' + jsVersion + '</strong>' +
        '               <button class="markdown-modal-close" onclick=\'$("#bd-wn-modal").remove();\'></button>' +
        '           </div><!--header-->' +
        '           <div class="scroller-wrap">' +
        '               <div class="scroller">';

    if (bdchangelog.changes != null) {
        changeLog += '' +
            '<h1 class="changelog-added">' +
            '   <span>New Stuff</span>' +
            '</h1>' +
            '<ul>';

        for (var change in bdchangelog.changes) {
            change = bdchangelog.changes[change];

            changeLog += '' +
                '<li>' +
                '   <strong>' + change.title + '</strong>' +
                '   <div>' + change.text + '</div>' +
                '</li>';
        }

        changeLog += '</ul>';
    }

    if (bdchangelog.fixes != null) {
        changeLog += '' +
            '<h1 class="changelog-fixed">' +
            '   <span>Fixed</span>' +
            '</h1>' +
            '<ul>';

        for (var fix in bdchangelog.fixes) {
            fix = bdchangelog.fixes[fix];

            changeLog += '' +
                '<li>' +
                '   <strong>' + fix.title + '</strong>' +
                '   <div>' + fix.text + '</div>' +
                '</li>';
        }

        changeLog += '</ul>';
    }

    if (bdchangelog.upcoming != null) {
        changeLog += '' +
            '<h1 class="changelog-in-progress">' +
            '   <span>Coming Soon</span>' +
            '</h1>' +
            '<ul>';

        for (var upc in bdchangelog.upcoming) {
            upc = bdchangelog.upcoming[upc];

            changeLog += '' +
                '<li>' +
                '   <strong>' + upc.title + '</strong>' +
                '   <div>' + upc.text + '</div>' +
                '</li>';
        }

        changeLog += '</ul>';
    }

    changeLog += '' +
        '               </div><!--scoller-->' +
        '           </div><!--scroller-wrap-->' +
        '           <div class="footer">' +
        '           </div><!--footer-->' +
        '       </div><!--change-log-->' +
        '   </div><!--modal-inner-->' +
        '</div><!--modal-->';

    return changeLog;
};

Core.prototype.alert = function (title, text) {
    var id = '';
    for( var i=0; i < 5; i++ )
        id += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".charAt(Math.floor(Math.random() * "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".length)); 
    var bdAlert = '\
    <div id="bda-alert-'+id+'" class="modal bda-alert" style="opacity:1" data-bdalert="'+id+'">\
        <div class="modal-inner" style="box-shadow:0 0 8px -2px #000;">\
            <div class="markdown-modal">\
                <div class="markdown-modal-header">\
                    <strong style="float:left"><span>BetterDiscord - </span><span>'+title+'</span></strong>\
                    <span></span>\
                    <button class="markdown-modal-close" onclick=\'document.getElementById("bda-alert-'+id+'").remove(); utils.removeBackdrop("'+id+'");\'></button>\
                </div>\
                <div class="scroller-wrap fade">\
                    <div style="font-weight:700" class="scroller">'+text+'</div>\
                </div>\
                <div class="markdown-modal-footer">\
                    <span style="float:right"> for support.</span>\
                    <a style="float:right" href="https://discord.gg/0Tmfo5ZbOR9NxvDd" target="_blank">#support</a>\
                    <span style="float:right">Join </span>\
                </div>\
            </div>\
        </div>\
    </div>\
    ';
    $("body").append(bdAlert);
    utils.addBackdrop(id);
};
/* BetterDiscordApp EmoteModule JavaScript
 * Version: 1.5
 * Author: Jiiks | http://jiiks.net
 * Date: 26/08/2015 - 15:29
 * Last Update: 14/10/2015 - 09:48
 * https://github.com/Jiiks/BetterDiscordApp
 * Note: Due to conflicts autocapitalize only supports global emotes
 */

/*
 * =Changelog=
 * -v1.5
 * --Twitchemotes.com api
 */

var emotesFfz = {};
var emotesBTTV = {};
var emotesTwitch = {
    "emotes": {
        "emote": {
            "image_id": 0
        }
    }
}; //for ide
var subEmotesTwitch = {};

function EmoteModule() {}

EmoteModule.prototype.init = function () {};

EmoteModule.prototype.getBlacklist = function () {
    $.getJSON("https://cdn.rawgit.com/Jiiks/betterDiscordApp/" + _hash + "/data/emotefilter.json", function (data) {
        bemotes = data.blacklist;
    });
};

EmoteModule.prototype.obsCallback = function (mutation) {
    var self = this;

    //if (!settingsCookie["bda-es-7"]) return;

    /*$(".emoji").each(function() {
        var t = $(this);
        if(t.attr("src").indexOf(".png") != -1) {
            t.replaceWith(t.attr("alt"));
        }
    });*/
    
    /*$(".emoji:not(.emote)").each(function() {
        var t = $(this);
        t.addClass("emote");
        t.wrap('<span class="emotewrapper"></span>');
        t.parent().append($("<input/>", { class: "fav", title: "Favorite!", type: "button" }));
    });*/
    


    for (var i = 0; i < mutation.addedNodes.length; ++i) {
        var next = mutation.addedNodes.item(i);
        if (next) {
            var nodes = self.getNodes(next);
            for (var node in nodes) {
                if (nodes.hasOwnProperty(node)) {
                    var elem = nodes[node].parentElement;
                    if (elem && elem.classList.contains('edited')) {
                        self.injectEmote(elem);
                    } else {
                        self.injectEmote(nodes[node]);
                    }
                }
            }
        }
    }
};

EmoteModule.prototype.getNodes = function (node) {
    var next;
    var nodes = [];

    var treeWalker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);

    while (next = treeWalker.nextNode()) {
        nodes.push(next);
    }
    return nodes;
};

var bemotes = [];
var spoilered = [];


EmoteModule.prototype.injectEmote = function(node) {
    var self = this;

    if (!node.parentElement) return;
    var parent = $(node).parent();
    
    if(!parent.hasClass("markup") && !parent.hasClass("message-content")) return;


    function inject() {
        var contents = parent.contents();
        
        contents.each(function(i) {
            if(contents[i] == undefined) return;
            var nodeValue = contents[i].nodeValue;
            if(nodeValue == null) return;
            //if(nodeValue.indexOf("react-") > -1) return;

            if(contents[i].nodeType == 8) return;
            contents.splice(i, 1);

            var words = nodeValue.split(/([^\s]+)([\s]|$)/g).filter(function(e){ return e});
            
            var splice = 0;

            var doInject = false;
            var text = null;

            words.forEach(function(w, index, a) {
                
                if(w.indexOf("[!s]") > -1) {
                    w = w.replace("[!s]", "");
                    parent.data("spoilered", false);
                    parent.addClass("spoiler");
                }
                
                var allowedClasses = ["flip", "spin", "pulse", "spin2", "spin3", "1spin", "2spin", "3spin", "tr", "bl", "br", "shake", "shake2", "shake3", "flap"];
                var useEmoteClass = false;
                var emoteClass = "";
                var skipffz = false;
                
                var sw = w;
                
                if(w.indexOf(":") > -1) {
                    var split = w.split(":");
                    if(split[0] != "" && split[1] != "") {
                        if(allowedClasses.indexOf(split[1]) > -1) {
                            sw = split[0];
                            emoteClass = settingsCookie["bda-es-8"] ? "emote" + split[1] : "";
                        }
                        if(split[1] == "bttv") {
                            sw = split[0];
                            skipffz = true;
                        }
                    }
                }
                
                if ($.inArray(sw, bemotes) == -1) {
                
                    if(typeof emotesTwitch !== 'undefind' && settingsCookie["bda-es-7"]) {
                        if(emotesTwitch.emotes.hasOwnProperty(sw) && sw.length >= 4) { 
                            if(text != null) { contents.splice(i + splice++, 0, document.createTextNode(text));  text = null;}
                            var url = twitchEmoteUrlStart + emotesTwitch.emotes[sw].image_id + twitchEmoteUrlEnd;
                            contents.splice(i + splice++, 0, self.createEmoteElement(sw, url, emoteClass));
                            doInject = true;
                            return;
                        }
                    }
                    
                    if(typeof subEmotesTwitch !== 'undefined' && settingsCookie["bda-es-7"]) {
                        if(subEmotesTwitch.hasOwnProperty(sw) && sw.length >= 4) {
                            if(text != null) { contents.splice(i + splice++, 0, document.createTextNode(text));  text = null;}
                            var url = twitchEmoteUrlStart + subEmotesTwitch[sw] + twitchEmoteUrlEnd;
                            contents.splice(i + splice++, 0, self.createEmoteElement(sw, url, emoteClass));
                            doInject = true;
                            return;
                        }
                    }
                    
                    if (typeof emotesBTTV !== 'undefined' && settingsCookie["bda-es-2"]) { 
                        if(emotesBTTV.hasOwnProperty(sw) && sw.length >= 4) {
                            if(text != null) { contents.splice(i + splice++, 0, document.createTextNode(text));  text = null;}
                            var url = emotesBTTV[sw];
                            contents.splice(i + splice++, 0, self.createEmoteElement(sw, url, emoteClass));
                            doInject = true;
                            return;
                        }
                    }
                    
                    if ((typeof emotesFfz !== 'undefined' && settingsCookie["bda-es-1"]) && (!skipffz || !emotesBTTV2.hasOwnProperty(sw))) { 
                        if(emotesFfz.hasOwnProperty(sw) && sw.length >= 4) {
                            if(text != null) { contents.splice(i + splice++, 0, document.createTextNode(text));  text = null;}
                            var url = ffzEmoteUrlStart + emotesFfz[sw] + ffzEmoteUrlEnd;
                            contents.splice(i + splice++, 0, self.createEmoteElement(sw, url, emoteClass));
                            doInject = true;
                            return;
                        }
                    }
    
                    if (typeof emotesBTTV2 !== 'undefined' && settingsCookie["bda-es-2"]) { 
                        if(emotesBTTV2.hasOwnProperty(sw) && sw.length >= 4) {
                            if(text != null) { contents.splice(i + splice++, 0, document.createTextNode(text));  text = null;}
                            var url = bttvEmoteUrlStart + emotesBTTV2[sw] + bttvEmoteUrlEnd;
                            if(skipffz && emotesFfz.hasOwnProperty(sw)) sw = sw + ":bttv";
                            contents.splice(i + splice++, 0, self.createEmoteElement(sw, url, emoteClass));
                            doInject = true;
                            return;
                        }
                    }
                }
                
                if(text == null) {
                    text = w;
                } else {
                    text += "" + w;
                }

                if(index === a.length - 1) {
                    contents.splice(i + splice, 0, document.createTextNode(text));
                }
            });

            if(doInject) {
                var oldHeight = parent.outerHeight();
                parent.html(contents);
                var scrollPane = $(".scroller.messages").first();
                scrollPane.scrollTop(scrollPane.scrollTop() + (parent.outerHeight() - oldHeight));
            }

        });
    }
    
    inject();
    if(parent.children().hasClass("edited")) {
        setTimeout(inject, 250);
    }

    

};

EmoteModule.prototype.createEmoteElement = function(word, url, mod) {
    var len = Math.round(word.length / 4);
    var name = word.substr(0, len) + "\uFDD9" + word.substr(len, len) + "\uFDD9" + word.substr(len * 2, len) + "\uFDD9" + word.substr(len * 3);
    var html = '<span class="emotewrapper"><img draggable="false" style="max-height:32px;" class="emote '+ mod +'" alt="' + name + '" src="' + url + '"/><input onclick=\'quickEmoteMenu.favorite(\"' + name + '\", \"' + url + '\");\' class="fav" title="Favorite!" type="button"></span>';
    return $.parseHTML(html.replace(new RegExp("\uFDD9", "g"), ""))[0];
};

EmoteModule.prototype.autoCapitalize = function () {

    var self = this;

    $('body').delegate($(".channel-textarea-inner textarea:first"), 'keyup change paste', function () {
        if (!settingsCookie["bda-es-4"]) return;

        var text = $(".channel-textarea-inner textarea:first").val();
        if (text == undefined) return;

        var lastWord = text.split(" ").pop();
        if (lastWord.length > 3) {
            if (lastWord == "danSgame") return;
            var ret = self.capitalize(lastWord.toLowerCase());
            if (ret !== null && ret !== undefined) {
                $(".channel-textarea-inner textarea:first").val(text.replace(lastWord, ret));
            }
        }
    });
};

EmoteModule.prototype.capitalize = function (value) {
    var res = emotesTwitch.emotes;
    for (var p in res) {
        if (res.hasOwnProperty(p) && value == (p + '').toLowerCase()) {
            return p;
        }
    }
};
/* BetterDiscordApp PublicSevers JavaScripts
 * Version: 1.0
 * Author: Jiiks | http://jiiks.net
 * Date: 27/08/2015 - 14:16
 * https://github.com/Jiiks/BetterDiscordApp
 */

class PublicServers {

    constructor() {
        this.v2p = new V2_PublicServers();
    }

    get endPoint() {
        return 'https://search.discordservers.com';
    }

    get button() {
        let self = this;
        let btn = $("<div/>", {
            class: 'guild',
            id: 'bd-pub-li',
            css: {
                'height': '20px',
                'display': settingsCookie['bda-gs-1'] ? "" : "none"
            }
        }).append($("<div/>", {
            class: 'guild-inner',
            css: {
                'height': '20px',
                'border-radius': '4px'
            }
        }).append($("<a/>", {

        }).append($("<div/>", {
            text: 'public',
            id: 'bd-pub-button',
            css: {
                'line-height': '20px',
                'font-size': '12px'
            },
            click: () => { self.v2p.render(); }
        }))));

        return btn;
    }

    init() {
        let self = this;

        let guilds = $(".guilds>:first-child");
        guilds.after(self.button);

    }

    get layer() {
        let self = this;
        let layer = `<div id="bd-pubs-layer" class="layer bd-layer" tabindex="0">
            <div class="ui-standard-sidebar-view">
                <div class="sidebar-region">
                    <div class="scroller-wrap fade dark">
                        <div class="scroller">
                            <div class="sidebar">
                                <div class="ui-tab-bar SIDE">
                                    <div class="ui-tab-bar-header" style="font-size: 16px;">Public Servers</div>
                                    <div class="ui-tab-bar-separator margin-top-8 margin-bottom-8"></div>
                                    <div class="ui-form-item">
                                        <div class="ui-text-input flex-vertical" style="width: 186px; margin-left: 10px;">
                                            <input type="text" class="input default" id="bd-pubs-search" name="bd-pubs-search" value="" placeholder="Search..." maxlength="999">
                                        </div>
                                    </div>
                                    <div class="ui-tab-bar-separator margin-top-8 margin-bottom-8"></div>
                                    <div class="ui-tab-bar-header">Categories</div>
                                    <div class="ui-tab-bar-item selected">All</div>
                                    <div class="ui-tab-bar-item">FPS Games</div>
                                    <div class="ui-tab-bar-item">MMO Games</div>
                                    <div class="ui-tab-bar-item">Strategy Games</div>
                                    <div class="ui-tab-bar-item">Sports Games</div>
                                    <div class="ui-tab-bar-item">Puzzle Games</div>
                                    <div class="ui-tab-bar-item">Retro Games</div>
                                    <div class="ui-tab-bar-item">Party Games</div>
                                    <div class="ui-tab-bar-item">Tabletop Games</div>
                                    <div class="ui-tab-bar-item">Sandbox Games</div>
                                    <div class="ui-tab-bar-item">Simulation Games</div>
                                    <div class="ui-tab-bar-item">Community</div>
                                    <div class="ui-tab-bar-item">Language</div>
                                    <div class="ui-tab-bar-item">Programming</div>
                                    <div class="ui-tab-bar-item">Other</div>
                                    <div class="ui-tab-bar-separator margin-top-8 margin-bottom-8"></div>
                                    <div class="ui-tab-bar-header" style="font-size: 9px;font-weight: 700;">Listing provided by: <a href="https://discordservers.com" target="_blank">Discordservers.com</a></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="content-region">
                    <div class="scroller-wrap fade dark">
                        <div class="scroller">
                            <div class="content-column" id="bd-pubs-bg-spinner">
                                <div style="height: 100vh; margin: -60px -40px;">
                                    <span class="spinner" type="wandering-cubes" style="top: 50%;position: relative;left: 50%;transform: translate(-50%, -50%);">
                                        <span class="spinner-inner spinner-wandering-cubes">
                                            <span class="spinner-item"></span>
                                            <span class="spinner-item"></span>
                                        </span>
                                    </span>
                                </div>
                            </div>
                            <div class="content-column" id="bd-pubs-listing-container" style="display:none;">
                                <span id="bd-pubs-results" style="color: #72767d;font-weight: 700;"></span>
                                <div id="bd-pubs-listing"></div>
                            </div>
                            <div class="tools">
                                <div class="btn-close">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" style="width: 18px; height: 18px;"><g class="background" fill="none" fill-rule="evenodd"><path d="M0 0h12v12H0"></path><path class="fill" fill="#dcddde" d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"></path></g></svg>
                                </div>
                                <div class="esc-text">ESC</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
        
        layer = $(layer);

        layer.on("blur", e => {
            if(e.relatedTarget.id === 'bd-pubs-search') return;
            layer.focus();
            console.log("blur:");
            console.log(e);
        });

        layer.on("keydown", e => {
            if(e.which === 13 && e.target.id === 'bd-pubs-search') {
                let category = $("#bd-pubs-layer .ui-tab-bar-item.selected").text();
                if(category === 'All') category = '';
                self.search(self.query({'term': e.target.value, 'category': category}), true);
                return;
            }
            if(e.which !== 27) return;
            self.hide();
        });

        layer.find('.btn-close').on('click', e => { self.hide(); });

        layer.find('.ui-tab-bar.SIDE .ui-tab-bar-item').on('click', e => {
            let category = e.target.textContent;
            if(category === 'All') category = '';
            self.search(self.query({'term': $("#bd-pubs-search").val(), 'category': category}), true);
        });

        return layer;
    }

    serverCard(serverInfo) {
        return `<div class="ui-card ui-card-primary bd-server-card" style="margin-top: 5px">
            <div class="ui-flex horizontal" style="display: flex; flex-flow: row nowrap; justify-content: flex-start; align-items: stretch; flex: 1 1 auto;">
                <div class="ui-flex-child" style="flex: 0 1 auto; padding: 5px;">
                    <div class="bd-pubs-server-icon" style="width: 100px; height: 100px; background-size: cover; background-image: url(${serverInfo.icon})"></div>
                </div>
                <div class="ui-flex-child" style="flex: 1 1 auto; padding: 5px;">
                    <div class="ui-flex horizontal">
                        <div class="ui-form-item" style="flex: 1 1 auto">
                            <h5 class="ui-form-title h5 margin-reset">${serverInfo.name}</h5>
                        </div>
                        <div class="ui-form-item">
                            <h5 class="ui-form-title h5 margin-reset">${serverInfo.online}/${serverInfo.members} Members</h5>
                        </div>
                    </div>
                    <div class="ui-flex horizontal">
                        <div class="scroller-wrap fade dark" style="min-height: 60px; max-height: 60px; border-top: 1px solid #3f4146; border-bottom: 1px solid #3f4146; padding-top: 5px">
                            <div class="scoller">
                                <div style="font-size: 13px; color: #b9bbbe">
                                    ${serverInfo.description}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="ui-flex horizontal">
                        <div class="ui-flex-child bd-server-tags" style="flex: 1 1 auto">${serverInfo.categories.join(" ,")}</div>
                        <button type="button" class="ui-button filled brand small grow" style="min-height: 12px; margin-top: 4px;">
                            <div class="ui-button-contents">Join</div>
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
    }

    get bdServerCard() {

        let serverInfo = {
            'name': 'BetterDiscord',
            'icon': 'https://cdn.discordapp.com/icons/86004744966914048/c8d49dc02248e1f55caeb897c3e1a26e.webp',
            'online': '7500+',
            'members': '20000+',
            'description': 'Official BetterDiscord support server'
        };

        return `<div class="ui-card ui-card-primary bd-server-card" style="margin-top: 5px">
            <div class="ui-flex horizontal" style="display: flex; flex-flow: row nowrap; justify-content: flex-start; align-items: stretch; flex: 1 1 auto;">
                <div class="ui-flex-child" style="flex: 0 1 auto; padding: 5px;">
                    <div class="bd-pubs-server-icon" style="width: 100px; height: 100px; background-size: cover; background-image: url(${serverInfo.icon})"></div>
                </div>
                <div class="ui-flex-child" style="flex: 1 1 auto; padding: 5px;">
                    <div class="ui-flex horizontal">
                        <div class="ui-form-item" style="flex: 1 1 auto">
                            <h5 class="ui-form-title h5 margin-reset">${serverInfo.name}</h5>
                        </div>
                        <div class="ui-form-item">
                            <h5 class="ui-form-title h5 margin-reset">Too many members</h5>
                        </div>
                    </div>
                    <div class="ui-flex horizontal">
                        <div class="scroller-wrap fade dark" style="min-height: 60px; max-height: 60px; border-top: 1px solid #3f4146; border-bottom: 1px solid #3f4146; padding-top: 5px">
                            <div class="scoller">
                                <div style="font-size: 13px; color: #b9bbbe">
                                    ${serverInfo.description}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="ui-flex horizontal">
                        <div class="ui-flex-child bd-server-tags" style="flex: 1 1 auto"></div>
                        <button type="button" class="ui-button filled brand small grow" style="min-height: 12px; margin-top: 4px;">
                            <div class="ui-button-contents">Join</div>
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
    }


    getPanel() {
        console.log("pubs get panel");
        return '<div></div>';
    }

    getPinnedServer() {
        console.log("pubs get pinned server");
        return '<div></div>';
    }

    hidePinnedServer() {
        console.log("pubs hide pinned server");
    }

    showPinnedServer() {
        console.log("pubs show pinned server");
    }

    show() {
        let self = this;
        $(".layers").append(self.layer);
        //self.search("", true);
    }

    hide() {
        $("#bd-pubs-layer").remove();
    }

    loadServers(dataset, search, clear) {
        console.log("pubs load servers");
    }

    search(query, clear) {
        
        let self = this;
        let $list = $("#bd-pubs-listing");
        if(clear) { 
            $list.empty(); 
            $("#bd-pubs-listing-container").hide();
            $("#bd-pubs-bg-spinner").show();
        }
        $.ajax({
            method: 'GET',
            url: `${self.endPoint}?${query}`,
            success: data => {
                $list.append(self.bdServerCard);
                data.results.map(server => {
                    $list.append(self.serverCard(server));
                });
                $("#bd-pubs-listing-container").show();
                $("#bd-pubs-bg-spinner").hide();
                self.setSearchText(1, $(".bd-server-card").size(), data.total, null, $("#bd-pubs-search").val());
            }
        });
    }

    setSearchText(start, end, total, category, term) {
        if(!category) category = $("#bd-pubs-layer .ui-tab-bar-item.selected").text();
        let text = `Showing ${start}-${end} of ${total} results in ${category}`;
        if(term && term.length) text += ` for: ${term}`;
        $("#bd-pubs-results").text(text);
    }

    get next() {
        let self = this;
        if(!self.next) return null;
    }

    joinServer(code) {
        console.log("pubs join");
    }

    joinServerDirect(code) {
        console.log("pubs join direct");
    }

    escape(unsafe) {
        console.log("pubs escape");
    }

    query(params) {
        return require('querystring').stringify(params);
    }

}






























































































































































/* BetterDiscordApp QuickEmoteMenu JavaScript
 * Version: 1.3
 * Author: Jiiks | http://jiiks.net
 * Date: 26/08/2015 - 11:49
 * Last Update: 29/08/2015 - 11:46
 * https://github.com/Jiiks/BetterDiscordApp
 */

function QuickEmoteMenu() {

}

QuickEmoteMenu.prototype.init = function() {

    $(document).on("mousedown", function(e) {
        if(e.target.id != "rmenu") $("#rmenu").remove();
    });
    this.favoriteEmotes = {};
    var fe = bdStorage.get("bdfavemotes");
    if (fe !== "" && fe !== null) {
        this.favoriteEmotes = JSON.parse(atob(fe));
    }

    var qmeHeader="";
    qmeHeader += "<div id=\"bda-qem\">";
    qmeHeader += "    <button class=\"active\" id=\"bda-qem-twitch\" onclick='quickEmoteMenu.switchHandler(this); return false;'>Twitch<\/button>";
    qmeHeader += "    <button id=\"bda-qem-favourite\" onclick='quickEmoteMenu.switchHandler(this); return false;'>Favourite<\/button>";
    qmeHeader += "    <button id=\"bda-qem-emojis\" onclick='quickEmoteMenu.switchHandler(this); return false;'>Emojis<\/buttond>";
    qmeHeader += "<\/div>";
    this.qmeHeader = qmeHeader;

    var teContainer="";
    teContainer += "<div id=\"bda-qem-twitch-container\">";
    teContainer += "    <div class=\"scroller-wrap fade\">";
    teContainer += "        <div class=\"scroller\">";
    teContainer += "            <div class=\"emote-menu-inner\">";
    for (var emote in emotesTwitch.emotes) {
        if (emotesTwitch.emotes.hasOwnProperty(emote)) {
            var id = emotesTwitch.emotes[emote].image_id;
            teContainer += "<div class=\"emote-container\">";
            teContainer += "    <img class=\"emote-icon\" id=\""+emote+"\" alt=\"\" src=\"https://static-cdn.jtvnw.net/emoticons/v1/"+id+"/1.0\" title=\""+emote+"\">";
            teContainer += "    </img>";
            teContainer += "</div>";
        }
    }
    teContainer += "            <\/div>";
    teContainer += "        <\/div>";
    teContainer += "    <\/div>";
    teContainer += "<\/div>";
    this.teContainer = teContainer;

    var faContainer="";
    faContainer += "<div id=\"bda-qem-favourite-container\">";
    faContainer += "    <div class=\"scroller-wrap fade\">";
    faContainer += "        <div class=\"scroller\">";
    faContainer += "            <div class=\"emote-menu-inner\">";
    for (var emote in this.favoriteEmotes) {
        var url = this.favoriteEmotes[emote];
        faContainer += "<div class=\"emote-container\">";
        faContainer += "    <img class=\"emote-icon\" alt=\"\" src=\""+url+"\" title=\""+emote+"\" oncontextmenu='quickEmoteMenu.favContext(event, this);'>";
        faContainer += "    </img>";
        faContainer += "</div>";
    }
    faContainer += "            <\/div>";
    faContainer += "        <\/div>";
    faContainer += "    <\/div>";
    faContainer += "<\/div>";
    this.faContainer = faContainer;
};

QuickEmoteMenu.prototype.favContext = function(e, em) {
    e.stopPropagation();
    var menu = $('<div/>', { id: "rmenu", "data-emoteid": $(em).prop("title"), text: "Remove" });
    menu.css({
        top: e.pageY - $("#bda-qem-favourite-container").offset().top,
        left: e.pageX - $("#bda-qem-favourite-container").offset().left
    });
    $(em).parent().append(menu);
    menu.on("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).remove();

        delete quickEmoteMenu.favoriteEmotes[$(this).data("emoteid")];
        quickEmoteMenu.updateFavorites();
        return false;
    });
    return false;
};

QuickEmoteMenu.prototype.switchHandler = function(e) {
    this.switchQem($(e).attr("id"));
};

QuickEmoteMenu.prototype.switchQem = function(id) {
    var twitch = $("#bda-qem-twitch");
    var fav = $("#bda-qem-favourite");
    var emojis = $("#bda-qem-emojis");
    twitch.removeClass("active");
    fav.removeClass("active");
    emojis.removeClass("active");

    $(".emoji-picker").hide();
    $("#bda-qem-favourite-container").hide();
    $("#bda-qem-twitch-container").hide();

    switch(id) {
        case "bda-qem-twitch":
            twitch.addClass("active");
            $("#bda-qem-twitch-container").show();
        break;
        case "bda-qem-favourite":
            fav.addClass("active");
            $("#bda-qem-favourite-container").show();
        break;
        case "bda-qem-emojis":
            emojis.addClass("active");
            $(".emoji-picker").show();
        break;
    }
    this.lastTab = id;

    var emoteIcon = $(".emote-icon");
    emoteIcon.off();
    emoteIcon.on("click", function () {
        var emote = $(this).attr("title");
        var ta = $(".channel-textarea-inner textarea");
        ta.val(ta.val().slice(-1) == " " ? ta.val() + emote : ta.val() + " " + emote);
    });
};

QuickEmoteMenu.prototype.obsCallback = function (e) {

    if(!settingsCookie["bda-es-9"]) {
        e.addClass("bda-qme-hidden");
    } else {
        e.removeClass("bda-qme-hidden");
    }

    if(!settingsCookie["bda-es-0"]) return;
    var self = this;

    e.prepend(this.qmeHeader);
    e.append(this.teContainer);
    e.append(this.faContainer);

    if(this.lastTab == undefined) {
        this.lastTab = "bda-qem-favourite";
    } 
    this.switchQem(this.lastTab);
};

QuickEmoteMenu.prototype.favorite = function (name, url) {

    if (!this.favoriteEmotes.hasOwnProperty(name)) {
        this.favoriteEmotes[name] = url;
    }

    this.updateFavorites();
};

QuickEmoteMenu.prototype.updateFavorites = function () {

    var faContainer="";
    faContainer += "<div id=\"bda-qem-favourite-container\">";
    faContainer += "    <div class=\"scroller-wrap fade\">";
    faContainer += "        <div class=\"scroller\">";
    faContainer += "            <div class=\"emote-menu-inner\">";
    for (var emote in this.favoriteEmotes) {
        var url = this.favoriteEmotes[emote];
        faContainer += "<div class=\"emote-container\">";
        faContainer += "    <img class=\"emote-icon\" alt=\"\" src=\""+url+"\" title=\""+emote+"\" oncontextmenu='quickEmoteMenu.favContext(event, this);'>";
        faContainer += "    </img>";
        faContainer += "</div>";
    }
    faContainer += "            <\/div>";
    faContainer += "        <\/div>";
    faContainer += "    <\/div>";
    faContainer += "<\/div>";
    this.faContainer = faContainer;

    $("#bda-qem-favourite-container").replaceWith(faContainer);
    window.bdStorage.set("bdfavemotes", btoa(JSON.stringify(this.favoriteEmotes)));
};
function CustomCssEditor() { }

CustomCssEditor.prototype.init = function() {
var self = this;
self.hideBackdrop = false;
self.editor = CodeMirror.fromTextArea(document.getElementById("bd-custom-css-ta"), {
    lineNumbers: true,
    mode: 'css',
    indentUnit: 4,
    theme: 'material',
    scrollbarStyle: 'simple'
});

self.editor.on("change", function (cm) {
    var css = cm.getValue();
    self.applyCustomCss(css, false, false);
});

var attachEditor="";
attachEditor += "<div id=\"bd-customcss-attach-controls\">";
attachEditor += "       <ul class=\"checkbox-group\">";
attachEditor += "       <li>";
attachEditor += "           <div class=\"checkbox\" onclick=\"settingsPanel.updateSetting(this);\">";
attachEditor += "               <div class=\"checkbox-inner\"><input id=\"bda-css-0\" type=\"checkbox\" "+(settingsCookie["bda-css-0"] ? "checked" : "")+"><span><\/span><\/div>";
attachEditor += "               <span title=\"Update client css while typing\">Live Update<\/span>";
attachEditor += "           <\/div>";
attachEditor += "       <\/li>";
attachEditor += "       <li>";
attachEditor += "           <div class=\"checkbox\" onclick=\"settingsPanel.updateSetting(this);\">";
attachEditor += "               <div class=\"checkbox-inner\"><input id=\"bda-css-1\" type=\"checkbox\" "+(settingsCookie["bda-css-1"] ? "checked" : "")+"><span><\/span><\/div>";
attachEditor += "               <span title=\"Autosave css to storage when typing\">TEMPDISABLED<\/span>";
attachEditor += "           <\/div>";
attachEditor += "       <\/li>";
attachEditor += "        <li>";
attachEditor += "           <div class=\"checkbox\" onclick=\"settingsPanel.updateSetting(this);\">";
attachEditor += "               <div class=\"checkbox-inner\"><input id=\"bda-css-2\" type=\"checkbox\" "+(customCssEditor.hideBackdrop ? "checked" : "")+"><span><\/span><\/div>";
attachEditor += "               <span title=\"Hide the callout backdrop to disable modal close events\">Hide Backdrop<\/span>";
attachEditor += "           <\/div>";
attachEditor += "       <\/li>";
attachEditor += "   <\/ul>";
attachEditor += "   <div id=\"bd-customcss-detach-controls-buttons\">";
attachEditor += "       <button class=\"btn btn-primary\" id=\"bd-customcss-detached-update\" onclick=\"return false;\">Update<\/button>";
attachEditor += "       <button class=\"btn btn-primary\" id=\"bd-customcss-detached-save\"  onclick=\"return false;\">Save<\/button>";
attachEditor += "       <button class=\"btn btn-primary\" id=\"bd-customcss-detached-detach\" onclick=\"customCssEditor.detach(); return false;\">Detach</button>";
attachEditor += "   <\/div>";
attachEditor += "<\/div>";

this.attachEditor = attachEditor;

$("#bd-customcss-innerpane").append(attachEditor);

$("#bd-customcss-detached-update").on("click", function() {
        self.applyCustomCss(self.editor.getValue(), true, false);
        return false;
});
$("#bd-customcss-detached-save").on("click", function() {
        self.applyCustomCss(self.editor.getValue(), false, true);
        return false;
});


var detachEditor="";
    detachEditor += "<div id=\"bd-customcss-detach-container\">";
    detachEditor += "   <div id=\"bd-customcss-detach-editor\">";
    detachEditor += "   <\/div>";
    detachEditor += "<\/div>";
this.detachedEditor = detachEditor;
};

CustomCssEditor.prototype.attach = function() {
    $("#editor-detached").hide();
    $("#app-mount").removeClass("bd-detached-editor");
    $("#bd-customcss-pane").append($("#bd-customcss-innerpane"));
    $("#bd-customcss-detached-detach").show();
    $("#bd-customcss-detach-container").remove();
};

CustomCssEditor.prototype.detach = function() {
    var self = this;
    this.attach();
    $("#editor-detached").show();
    $("#bd-customcss-detached-detach").hide();
    $("#app-mount").addClass("bd-detached-editor");
    $(".app").parent().append(this.detachedEditor);
    $("#bd-customcss-detach-editor").append($("#bd-customcss-innerpane"));
};

CustomCssEditor.prototype.applyCustomCss = function (css, forceupdate, forcesave) {
    if ($("#customcss").length == 0) {
        $("head").append('<style id="customcss"></style>');
    }

    if(forceupdate || settingsCookie["bda-css-0"]) {
        $("#customcss").html(css);
    }

    if(forcesave) {
        window.bdStorage.set("bdcustomcss", btoa(css));
    }
};
/* BetterDiscordApp Settings Panel JavaScript
 * Version: 2.0
 * Author: Jiiks | http://jiiks.net
 * Date: 26/08/2015 - 11:54
 * Last Update: 27/11/2015 - 00:50
 * https://github.com/Jiiks/BetterDiscordApp
 */

var settingsButton = null;
var panel = null;

function SettingsPanel() {
    utils.injectJs("https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.25.0/codemirror.min.js");
    utils.injectJs("https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.25.0/mode/css/css.min.js");
    utils.injectJs("https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.25.0/addon/scroll/simplescrollbars.min.js");
    utils.injectCss("https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.25.0/addon/scroll/simplescrollbars.min.css");
    utils.injectCss("https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.25.0/theme/material.min.css");
    utils.injectJs("https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.4.2/Sortable.min.js");
}

SettingsPanel.prototype.init = function () {
    var self = this;
    self.v2SettingsPanel = new V2_SettingsPanel();
    self.construct();
    var body = $("body");

    if (settingsCookie["bda-es-0"]) {
        $("#twitchcord-button-container").show();
    } else {
        $("#twitchcord-button-container").hide();
    }

    if (settingsCookie["bda-gs-2"]) {
        body.addClass("bd-minimal");
    } else {
        body.removeClass("bd-minimal");
    }
    if (settingsCookie["bda-gs-3"]) {
        body.addClass("bd-minimal-chan");
    } else {
        body.removeClass("bd-minimal-chan");
    }

    if (settingsCookie["bda-gs-4"]) {
        voiceMode.enable();
    }

    if(settingsCookie["bda-gs-5"]) {
        $("#app-mount").addClass("bda-dark");
    }

    if (settingsCookie["bda-es-6"]) {
        //Pretty emote titles
        emoteNamePopup = $("<div class='tipsy tipsy-se' style='display: block; top: 82px; left: 1630.5px; visibility: visible; opacity: 0.8;'><div class='tipsy-inner'></div></div>");
        $(document).on("mouseover", ".emote", function () {
            var x = $(this).offset();
            var title = $(this).attr("alt");
            $(emoteNamePopup).find(".tipsy-inner").text(title);
            $(emoteNamePopup).css('left', x.left - 25);
            $(emoteNamePopup).css('top', x.top - 37);
            $(".app").append($(emoteNamePopup));
        });
        $(document).on("mouseleave", ".emote", function () {
            $(".tipsy").remove();
        });
    } else {
        $(document).off('mouseover', '.emote');
    }
    
    if(settingsCookie["bda-gs-8"]) {
        dMode.enable();
    } else {
        dMode.disable();
    }

    if(settingsCookie["bda-gs-b"]) {
        $("body").addClass("bd-blue");
    } else {
        $("body").removeClass("bd-blue");
    }
};

var customCssInitialized = false;
var lastTab = "";

SettingsPanel.prototype.changeTab = function (tab) {

    var self = this;

    lastTab = tab;

    var controlGroups = $("#bd-control-groups");
    $(".bd-tab").removeClass("selected");
    $(".bd-pane").hide();
    $("#" + tab).addClass("selected");
    $("#" + tab.replace("tab", "pane")).show();

    switch (tab) {
    case "bd-settings-tab":
        $(".bda-slist-top").show();
        break;
    case "bd-emotes-tab":
        $(".bda-slist-top").show();
        break;
    case "bd-customcss-tab":
        $(".bda-slist-top").show();
        if (!customCssInitialized) {
            customCssEditor.init();
            customCssInitialized = true;
        }
        break;
    case "bd-themes-tab":
        $(".bda-slist-top:first").hide();
        break;
    case "bd-plugins-tab":
        $(".bda-slist-top:first").hide();
        break;
    default:
        $(".bda-slist-top").show();
        break;
    }
};

SettingsPanel.prototype.updateSetting = function (checkbox) {
    var cb = $(checkbox).children().find('input[type="checkbox"]');
    var enabled = !cb.is(":checked");
    var id = cb.attr("id");
    cb.prop("checked", enabled);

    if(id == "bda-css-2") {
        $("#app-mount").removeClass("bd-hide-bd");
        customCssEditor.hideBackdrop = enabled;
        if(enabled) {
            $("#app-mount").addClass("bd-hide-bd")
        }
    }
    if(id == "bda-gs-8" && enabled) {
        mainCore.alert("Developer Mode Enabled", "Use F8 to break/resume execution<br>More coming soon")
    }


    settingsCookie[id] = enabled;

    this.updateSettings();
};

SettingsPanel.prototype.updateSettings = function() {
    if (settingsCookie["bda-es-0"]) {
        $("#twitchcord-button-container").show();
    } else {
        $("#twitchcord-button-container").hide();
    }

    if(settingsCookie["bda-gs-b"]) {
        $("body").addClass("bd-blue");
    } else {
        $("body").removeClass("bd-blue");
    }

    if (settingsCookie["bda-gs-2"]) {
        $("body").addClass("bd-minimal");
    } else {
        $("body").removeClass("bd-minimal");
    }
    if (settingsCookie["bda-gs-3"]) {
        $("body").addClass("bd-minimal-chan");
    } else {
        $("body").removeClass("bd-minimal-chan");
    }
    if (settingsCookie["bda-gs-1"]) {
        $("#bd-pub-li").show();
    } else {
        $("#bd-pub-li").hide();
    }
    if (settingsCookie["bda-gs-4"]) {
        voiceMode.enable();
    } else {
        voiceMode.disable();
    }
    $("#app-mount").removeClass("bda-dark");
    if(settingsCookie["bda-gs-5"]) {
        $("#app-mount").addClass("bda-dark");
    }
    if (settingsCookie["bda-es-6"]) {
        //Pretty emote titles
        emoteNamePopup = $("<div class='tipsy tipsy-se' style='display: block; top: 82px; left: 1630.5px; visibility: visible; opacity: 0.8;'><div class='tipsy-inner'></div></div>");
        $(document).on("mouseover", ".emote", function () {
            var x = $(this).offset();
            var title = $(this).attr("alt");
            $(emoteNamePopup).find(".tipsy-inner").text(title);
            $(emoteNamePopup).css('left', x.left - 25);
            $(emoteNamePopup).css('top', x.top - 32);
            $("div[data-reactid='.0.1.1']").append($(emoteNamePopup));
        });
        $(document).on("mouseleave", ".emote", function () {
            $(".tipsy").remove();
        });
    } else {
        $(document).off('mouseover', '.emote');
    } 

    if(settingsCookie["bda-gs-8"]) {
        dMode.enable();
    } else {
        dMode.disable();
    }

    mainCore.saveSettings();
};

SettingsPanel.prototype.construct = function () {
    var self = this;

    panel = $("<div/>", {
        id: "bd-pane",
        class: "settings-inner",
        css: {
            "display": "none"
        }
    });

    //Panel start and core settings

    var settingsInner = '\
        <div class="scroller-wrap">\
            <div class="scroller settings-wrapper settings-panel">\
            <div class="tab-bar TOP">\
                <div class="tab-bar-item bd-tab" id="bd-settings-tab" onclick=\'settingsPanel.changeTab("bd-settings-tab");\'>Core\
                </div>\
                <div class="tab-bar-item bd-tab" id="bd-emotes-tab" onclick=\'settingsPanel.changeTab("bd-emotes-tab");\'>Emotes\
                </div>\
                <div class="tab-bar-item bd-tab" id="bd-customcss-tab" onclick=\'settingsPanel.changeTab("bd-customcss-tab");\'>Custom CSS\
                </div>\
                <div class="tab-bar-item bd-tab" id="bd-plugins-tab" onclick=\'settingsPanel.changeTab("bd-plugins-tab");\'>Plugins\
                </div>\
                <div class="tab-bar-item bd-tab" id="bd-themes-tab" onclick=\'settingsPanel.changeTab("bd-themes-tab");\'>Themes\
                </div>\
                <div class="bda-slist-top">\
                    <button class="btn btn-primary" onclick="utils.exportSettings(); return false;">Export</button>\
                    <button class="btn btn-primary" onclick="utils.importSettings(); return false;">Import</button>\
                </div>\
            </div>\
            <div class="bd-settings">\
                <div class="bd-pane control-group" id="bd-settings-pane" style="display:none;">\
                    <ul class="checkbox-group">\
    ';

    for(var setting in settings) {
        var sett = settings[setting];
        var id = sett["id"];
        if(sett["cat"] != "core" || !sett["implemented"] || sett["hidden"]) continue;

        settingsInner += '\
            <li>\
                <div class="checkbox" onclick="settingsPanel.updateSetting(this);">\
                    <div class="checkbox-inner">\
                        <input type="checkbox" id="'+id+'" '+(settingsCookie[id] ? "checked" : "")+'>\
                        <span></span>\
                    </div>\
                    <span>\
                        '+setting+' - '+sett["info"]+'\
                    </span>\
                </div>\
            </li>\
        ';
    }

    settingsInner += '\
                    </ul>\
                </div>\
    ';
    //End core settings

    //Emote settings

    settingsInner += '\
        <div class="bd-pane control-group" id="bd-emotes-pane" style="display:none;">\
            <ul class="checkbox-group">\
    ';

    for(var setting in settings) {
        var sett = settings[setting];
        var id = sett["id"];
        if(sett["cat"] != "emote" || !sett["implemented"] || sett["hidden"]) continue;

        settingsInner += '\
            <li>\
                <div class="checkbox" onclick="settingsPanel.updateSetting(this);">\
                    <div class="checkbox-inner">\
                        <input type="checkbox" id="'+id+'" '+(settingsCookie[id] ? "checked" : "")+'>\
                        <span></span>\
                    </div>\
                    <span>\
                        '+setting+' - '+sett["info"]+'\
                    </span>\
                </div>\
            </li>\
        ';
    }

    settingsInner += '\
            </ul>\
        </div>\
    ';

    //End emote settings

    //Custom CSS Editor
    var _ccss = window.bdStorage.get("bdcustomcss");
    var ccss = "";
    if(_ccss !== null && _ccss !== "") {
        ccss = atob(_ccss);
    }
    customCssEditor.applyCustomCss(ccss, true, false);

    settingsInner += '\
        <div class="bd-pane control-group" id="bd-customcss-pane" style="display:none;">\
            <div id="editor-detached" style="display:none;">\
                <h3>Editor Detached</h3>\
                <button class="btn btn-primary" onclick="customCssEditor.attach(); return false;">Attach</button>\
            </div>\
            <div id="bd-customcss-innerpane">\
                <textarea id="bd-custom-css-ta">'+ccss+'</textarea>\
            </div>\
        </div>\
    ';

    //End Custom CSS Editor

    //Plugin pane

    settingsInner += '\
        <div class="bd-pane control-group" id="bd-plugins-pane" style="display:show;">\
            <div class="bda-slist-top">\
                <button class="btn btn-primary" onclick=\'betterDiscordIPC.send("asynchronous-message", { "arg": "opendir", "path": "plugindir" }); return false;\'>Open Plugin Folder</button>\
                <button class="btn btn-primary" onclick=\'window.open("https://betterdiscord.net/plugins"); return false;\'>Get Plugins</button>\
            </div>\
            <ul class="bda-slist">\
    ';

    $.each(bdplugins, function() {
        var plugin = this["plugin"];
        var hasSettings = false;
        if(typeof(plugin.getSettingsPanel) == "function") {
            hasSettings = plugin.getSettingsPanel() != null && plugin.getSettingsPanel() != "";
        }

        settingsInner += '\
            <li>\
                <div class="bda-left">\
                    <span class="bda-name">'+plugin.getName()+' v'+plugin.getVersion()+' by '+plugin.getAuthor()+'</span>\
                    <div class="scroller-wrap fade">\
                        <div class="scroller bda-description">'+plugin.getDescription()+'</div>\
                    </div>\
                </div>\
                <div class="bda-right">\
                    <div class="checkbox" onclick="pluginModule.handlePlugin(this);">\
                        <div class="checkbox-inner">\
                            <input id="'+plugin.getName().replace(" ", "__")+'" type="checkbox" '+(pluginCookie[plugin.getName()] ? "checked" : "")+'>\
                            <span></span>\
                        </div>\
                        <span></span>\
                    </div>\
                    <button class="btn btn-primary bda-plugin-reload" onclick="return false;" disabled>Reload</button>\
                    <button class="btn btn-primary bda-plugin-settings" onclick=\'pluginModule.showSettings("'+plugin.getName()+'"); return false;\' '+(hasSettings ? "" : "disabled")+'>Settings</button>\
                </div>\
            </li>\
        ';
    });

    settingsInner += '\
            </ul>\
        </div>\
    ';

    //End plugin pane

    //Theme pane

    settingsInner += '\
        <div class="bd-pane control-group" id="bd-themes-pane" style="display:none;">\
            <div class="bda-slist-top">\
                <button class="btn btn-primary" onclick=\'betterDiscordIPC.send("asynchronous-message", { "arg": "opendir", "path": "themedir" }); return false;\'>Open Theme Folder</button>\
                <button class="btn btn-primary" onclick=\'window.open("https://betterdiscord.net/themes"); return false;\'>Get Themes</button>\
            </div>\
            <ul class="bda-slist">\
    ';

    if(typeof(themesupport2) === "undefined") {
        settingsInner += "Your version does not support themes!";
    } else {
        $.each(bdthemes, function() {
        settingsInner += '\
            <li>\
                <div class="bda-left">\
                    <span class="bda-name">'+this["name"].replace(/_/g, " ")+' v'+this["version"]+' by '+this["author"]+'</span>\
                    <div class="scroller-wrap fade">\
                        <div class="scroller bda-description">'+this["description"]+'</div>\
                    </div>\
                </div>\
                <div class="bda-right">\
                    <div class="checkbox" onclick="themeModule.handleTheme(this);">\
                        <div class="checkbox-inner">\
                            <input id="ti'+this["name"]+'" type="checkbox" '+(themeCookie[this["name"]] ? "checked" : "")+'>\
                            <span></span>\
                        </div>\
                        <span></span>\
                    </div>\
                    <button class="btn btn-primary bda-plugin-reload" onclick="return false;" disabled>Reload</button>\
                </div>\
            </li>\
        ';
        });
    }

    settingsInner += '\
            </ul>\
        </div>\
    ';

    //End theme panel

    //Footer

    settingsInner += '\
        <div style="background:#2E3136; color:#ADADAD; height:30px; position:absolute; bottom:0; left:0; right:0;">\
            <span style="line-height:30px;margin-left:10px;">BetterDiscord v' + ((typeof(version) == "undefined") ? bdVersion : version)  + '(JSv' + jsVersion + ') by Jiiks</span>\
            <span style="float:right;line-height:30px;margin-right:10px;"><a href="http://betterdiscord.net" target="_blank">BetterDiscord.net</a></span>\
            <span id="bd-changelog" onclick=\'$("body").append(mainCore.constructChangelog());\'>changelog</span>\
        </div>\
        </div></div>\
    ';


    function showSettings() {
        $(".tab-bar-item").removeClass("selected");
        settingsButton.addClass("selected");
        $(".form .settings-right .settings-inner").first().hide();
        panel.show();
        if (lastTab == "") {
            self.changeTab("bd-settings-tab");
        } else {
            self.changeTab(lastTab);
        }
    }

    settingsButton = $("<div/>", {
        class: "tab-bar-item",
        text: "BetterDiscord",
        id: "bd-settings-new",
        click: showSettings
    });

    panel.html(settingsInner);
    this.panel = panel;
};

SettingsPanel.prototype.inject = function(mutation) {
    if(this.injectNew(mutation)) return;
    if(mutation.type != "childList") return;
    if(mutation.addedNodes.length <= 0) return;
    if($(mutation.addedNodes[0]).find(".user-settings-modal").length <= 0) return;

    var self = this;
    this.panel.hide();
    var tabBar = $(".tab-bar.SIDE").first();

    $(".tab-bar.SIDE .tab-bar-item").click(function () {
        $(".form .settings-right .settings-inner").first().show();
        $("#bd-settings-new").removeClass("selected");
        self.panel.hide();
    });

    tabBar.append(settingsButton);
    $(".form .settings-right .settings-inner").last().after(self.panel);
    $("#bd-settings-new").removeClass("selected");
};

/*New settingspanel temp until v2*/

SettingsPanel.prototype.injectNew = function(mutation) {
    let self = this;
    if(!mutation.target.classList.contains("layers")) return;
    if(!$(".ui-tab-bar-header:contains('App Settings')").length) return;
    if($("#bd-settings-sidebar").length) return;
    self.v2SettingsPanel.renderSidebar();
    /*$(".ui-tab-bar-item").off("click.bd").on("click.bd", e => {
    $(".ui-tab-bar-item").removeClass("selected");
    $(e.target).addClass("selected");
        self.hideBdSettingsPane();
    });
    let changeLogBtn = $(".ui-tab-bar-item:contains('Change Log')");
    let bdBtn = $("<div/>", {
        class: 'ui-tab-bar-item',
        text: 'BetterDiscord',
        click: function() { 
            $(".ui-tab-bar-item").removeClass("selected");
            $(this).addClass("selected");
            self.showBdSettingsPane();
        }
    });   
    let separator = $("<div/>", {
        class: 'ui-tab-bar-separator margin-top-8 margin-bottom-8'
    });
    separator.insertBefore(changeLogBtn.prev());
    bdBtn.insertBefore(changeLogBtn.prev()); 

    $(".ui-standard-sidebar-view").last().append(self.settingsPaneNew());
    $(".bd-pane").hide();
    $(".bd-pane").first().show();
    $(".bd-tab").removeClass("selected");
    $("#bd-core").addClass("selected");
    $("#bd-settingspane").hide();

    $(".ui-standard-sidebar-view>.sidebar-region").append(self.versionInfo());*/

    return true;
};

SettingsPanel.prototype.versionInfo = function() {
    let self = this;
    let element = $("<div/>", {
        class: 'bd-versioninfo-wrapper'
    }).append($("<span/>", {
        text: `BetterDiscord v${(typeof(version) === "undefined" ? bdVersion : version)}:${jsVersion} by `
    })).append($("<a/>", {
        text: 'Jiiks',
        href: 'https://google.com',
        target: '_blank'
    }));
    return element;
}

SettingsPanel.prototype.tabBarNew = function() {
    let self = this;
    let _tabBar = $("<div/>", {
        class: 'tab-bar TOP',
        style: 'border-bottom:none'
    });

    let items = [
        { 'id': 'bd-core', 'text': 'Core' },
        { 'id': 'bd-emotes', 'text': 'Emotes' },
        { 'id': 'bd-customcss', 'text': 'Custom CSS' },
        { 'id': 'bd-plugins', 'text': 'Plugins' },
        { 'id': 'bd-themes', 'text': 'Themes' }
    ];

    items.map(value => {
        _tabBar.append($("<div/>", {
            class: 'tab-bar-item bd-tab',
            text: value.text,
            id: value.id,
            click: () => self.changeTabNew(value.id)
        }));
    });

    return _tabBar;
}

SettingsPanel.prototype.changeTabNew = function(id) {
    $(".bd-tab").removeClass("selected");
    $(`#${id}`).addClass("selected");
    $(".bd-pane").hide();
    $(`#${id}-pane`).show();

    if(id === 'bd-customcss') {
        if (!customCssInitialized) {
            customCssEditor.init();
            customCssInitialized = true;
        }
    }

}

SettingsPanel.prototype.updateSettingNew = function (id, checked) {

    if(id == "bda-css-2") {
        $("#app-mount").removeClass("bd-hide-bd");
        customCssEditor.hideBackdrop = checked;
        if(checked) {
            $("#app-mount").addClass("bd-hide-bd")
        }
    }
    if(id == "bda-gs-8" && checked) {
        mainCore.alert("Developer Mode Enabled", "Use F8 to break/resume execution<br>More coming soon")
    }

    settingsCookie[id] = checked;

    this.updateSettings();
};

SettingsPanel.prototype.settingsSwitch = function(key) {
    let self = this;
    let setting = settings[key];
    return $("<div/>", {
        class: 'ui-flex flex-vertical flex-justify-start flex-align-stretch flex-nowrap ui-switch-item'
    }).append($("<div/>", {
        class: 'ui-flex flex-horizontal flex-justify-start flex-align-stretch flex-nowrap'
    }).append($("<h3/>", {
        class: 'ui-form-title h3 margin-reset margin-reset ui-flex-child',
        text: key
    })).append($("<label/>", {
        class: 'ui-switch-wrapper ui-flex-child',
        style: 'flex: 0 0 auto'
    }).append($("<input/>", {
        class: 'ui-switch-checkbox',
        type: 'checkbox',
        change: function() { self.updateSettingNew(setting.id, this.checked) },
        checked: settingsCookie[setting.id]
    })).append($("<div/>", {
        class: 'ui-switch'
    })))).append($("<div/>", {
        class: 'ui-form-text style-description margin-top-4',
        style: 'flex: 1 1 auto',
        text: setting.info
    }));
}

SettingsPanel.prototype.corePaneNew = function() {
    let self = this;
    let _pane = $("<div/>", {
        class: 'ui-form-item bd-pane',
        id: 'bd-core-pane',
        style: 'display:none'
    });

    Object.keys(settings).map(value => {
        let setting = settings[value];
        if(setting.cat !== 'core' || !setting.implemented || setting.hidden) return false;
        
        _pane.append(self.settingsSwitch(value))
    });

    return _pane;
}
SettingsPanel.prototype.emotesPaneNew = function() {
    let self = this;
    let _pane = $("<div/>", {
        class: 'ui-form-item bd-pane',
        id: 'bd-emotes-pane',
        style: 'display:none'
    });

    Object.keys(settings).map(value => {
        let setting = settings[value];
        if(setting.cat !== 'emote' || !setting.implemented || setting.hidden) return false;
        
        _pane.append(self.settingsSwitch(value))
    });

    return _pane;
}
SettingsPanel.prototype.customCssPaneNew = function() {
    let self = this;
    let _pane = $("<div/>", {
        class: 'ui-form-item bd-pane',
        id: 'bd-customcss-pane',
        style: 'display:none'
    });

    let attachBtn = $("<div/>", {
        id: 'editor-detached',
        style: 'display:none'
    }).append($("<h3/>", {
        text: 'Editor Detached'
    })).append($("<button/>", {
        class: 'btn btn-primary',
        text: 'Attach',
        click: () => { customCssEditor.attach(); }
    }));

    _pane.append(attachBtn);

    let _ccss = window.bdStorage.get("bdcustomcss");
    let ccss = "";
    if(_ccss !== null && _ccss !== "") {
        ccss = atob(_ccss);
    }

    let innerPane = $("<div/>", {
        id: 'bd-customcss-innerpane'
    }).append($("<textarea/>", {
        id: 'bd-custom-css-ta',
        text: ccss
    }));

    _pane.append(innerPane);

    return _pane;
}

SettingsPanel.prototype.pluginTemp = function(plugin, cb) {
    let item = $("<li/>", {

    }).append($("<div/>", {
        class: 'bda-left'
    }).append($("<span/>", {
        class: 'bda-name',
        text: `${plugin.getName()} v${plugin.getVersion()} by ${plugin.getAuthor()}`
    })).append($("<div/>", {
        class: 'scroller-wrap fade'
    }).append($("<div/>", {
        class: 'scroller bda-description',
        text: plugin.getDescription()
    })))).append($("<div/>", {
        class: 'bda-right'
    }).append($("<label/>", {
        class: 'ui-switch-wrapper ui-flex-child',
        style: 'flex: 0 0 auto'
    }).append($("<input/>", {
        class: 'ui-switch-checkbox',
        type: 'checkbox',
        change: function() { pluginModule.handlePluginT(plugin.getName(), this.checked) },
        checked: pluginCookie[plugin.getName()]
    })).append($("<div/>", {
        class: 'ui-switch'
    }))).append($("<button/>", {
        text: 'Reload',
        disabled: true,
        enabled: false,
        click: () => { return false; }
    })).append($("<button/>", {
        text: 'Settings',
        click: () => { pluginModule.showSettingsT(plugin.getName()) }
    })));

    return item;
}


SettingsPanel.prototype.pluginsPaneNew = function() {
    let self = this;
    let list = $("<ul/>", {
        class: 'bda-slist'
    });
    $.each(bdplugins, function() {
        let plugin = this["plugin"];
        list.append(self.pluginTemp(plugin));
    });
    return $("<div/>", {
        class: 'ui-form-item bd-pane',
        id: 'bd-plugins-pane',
        style: 'display:none'
    }).append(list);
}

SettingsPanel.prototype.themeTemp = function(theme) {
    let item = $("<li/>", {

    }).append($("<div/>", {
        class: 'bda-left'
    }).append($("<span/>", {
        class: 'bda-name',
        text: `${theme["name"].replace(/_/g, " ")} v${theme["version"]} by ${theme["author"]}`
    })).append($("<div/>", {
        class: 'scroller-wrap fade'
    }).append($("<div/>", {
        class: 'scroller bda-description',
        text: theme["description"]
    })))).append($("<div/>", {
        class: 'bda-right'
    }).append($("<label/>", {
        class: 'ui-switch-wrapper ui-flex-child',
        style: 'flex: 0 0 auto'
    }).append($("<input/>", {
        class: 'ui-switch-checkbox',
        type: 'checkbox',
        change: function() { themeModule.handleThemeT(theme["name"], this.checked) },
        checked: themeCookie[theme["name"]]
    })).append($("<div/>", {
        class: 'ui-switch'
    }))).append($("<button/>", {
        text: 'Reload',
        disabled: true,
        enabled: false,
        click: () => { return false; }
    })));

    return item;
}

SettingsPanel.prototype.themesPaneNew = function() {
    let self = this;
    let list = $("<ul/>", {
        class: 'bda-slist'
    });
    $.each(bdthemes, function() {
        let theme = this;
        list.append(self.themeTemp(theme));
    });
    return $("<div/>", {
        class: 'ui-form-item bd-pane',
        id: 'bd-themes-pane',
        style: 'display:none'
    }).append(list);
}

SettingsPanel.prototype.panesNew = function() {
    let self = this;
    let _panes = $("<div/>", {
        class: 'bd-settings-panes'
    }); 

    _panes.append(self.corePaneNew());
    _panes.append(self.emotesPaneNew());
    _panes.append(self.customCssPaneNew());
    _panes.append(self.pluginsPaneNew());
    _panes.append(self.themesPaneNew());

    return _panes;
}

SettingsPanel.prototype.settingsPaneNew = function() {
    let self = this;
    if(self.constructed) return self.constructed;
    let tools = $(".tools").clone();
    tools.find(".btn-close").on("click", () => { $(".tools").first().find(".btn-close").click(); });
    self.constructed = $("<div/>", {
        class: 'content-region',
        id: 'bd-settingspane',
        style: 'display:none'
    }).append($("<div/>", {
        class: 'scroller-wrap fade dark'
    }).append($("<div/>", {
        class: 'scroller'
    }).append($("<div/>", {
        class: 'content-column'
    }).append(self.tabBarNew()).append(self.panesNew())).append(tools)));
    return self.constructed;
};

SettingsPanel.prototype.showBdSettingsPane = function() {
    $(".ui-standard-sidebar-view .content-region").first().hide();
    $("#bd-settingspane").show();
};

SettingsPanel.prototype.hideBdSettingsPane = function() {
    $(".ui-standard-sidebar-view .content-region").first().show();
    $("#bd-settingspane").hide();
};

/* BetterDiscordApp Utilities JavaScript
 * Version: 1.0
 * Author: Jiiks | http://jiiks.net
 * Date: 26/08/2015 - 15:54
 * https://github.com/Jiiks/BetterDiscordApp
 */

var _hash;

function Utils() {

}

Utils.prototype.getTextArea = function () {
    return $(".channel-textarea-inner textarea");
};

Utils.prototype.jqDefer = function (fnc) {
    if (window.jQuery) {
        fnc();
    } else {
        setTimeout(function () {
            this.jqDefer(fnc);
        }, 100);
    }
};

Utils.prototype.getHash = function () {
    $.getJSON("https://api.github.com/repos/Jiiks/BetterDiscordApp/commits/master", function (data) {
        _hash = data.sha;
        emoteModule.getBlacklist();
    });
};

Utils.prototype.loadHtml = function (html, callback) {
    var container = $("<div/>", {
        class: "bd-container"
    }).appendTo("body");

    //TODO Inject these in next core update
    html = '//cdn.rawgit.com/Jiiks/BetterDiscordApp/' + _hash + '/html/' + html + '.html';

    container.load(html, callback());
};

Utils.prototype.injectJs = function (uri) {
    $("<script/>", {
        type: "text/javascript",
        src: uri
    }).appendTo($("body"));
};

Utils.prototype.injectCss = function (uri) {
    $("<link/>", {
        type: "text/css",
        rel: "stylesheet",
        href: uri
    }).appendTo($("head"));
};

Utils.prototype.log = function (message) {
    console.log('%c[%cBetterDiscord%c] %c'+message+'', 'color: red;', 'color: #303030; font-weight:700;', 'color:red;', '');
};

Utils.prototype.err = function (message) {
    console.log('%c[%cBetterDiscord%c] %c'+message+'', 'color: red;', 'color: red; font-weight:700;', 'color:red;', '');
};

Utils.prototype.importSettings = function() {
    mainCore.alert("Import Settings", '<div class="form" style="width:100%;"><div class="control-group"><textarea id="bda-import-textarea" style="min-height:150px;"></textarea></div><button id="bda-import-settings" class="btn btn-primary">Import</button></div>');
    $("#bda-import-settings").off("click").on("click", function() {
        var obj;
        try {
            obj = JSON.parse($("#bda-import-textarea").val());
        }catch(err) {
            mainCore.alert("Invalid Data", err);
            return false;
        }
        try {
            for(key in obj.settings) {
                var val = obj.settings[key];
                if(settingsCookie.hasOwnProperty(key)) {
                    settingsCookie[key] = val;
                    var cb = $("#" + key);
                    cb.prop("checked", val);
                    settingsPanel.updateSettings();
                }
            }
            window.bdStorage.set("bdcustomcss", obj.customCss);
            var ccss = window.bdStorage.get("bdcustomcss");
            if (!customCssInitialized) {
                customCssEditor.init();
                customCssInitialized = true;
            }
            customCssEditor.applyCustomCss(ccss, settingsCookie["bda-css-0"], false); 
            customCssEditor.editor.setValue(ccss);
        }catch(err) {
            mainCore.alert("Invalid Data", err);
            return false;
        }

        try {
            $.each(obj.plugins, function(plugin) {
                var enabled = obj.plugins[plugin];
                if(bdplugins.hasOwnProperty(plugin)) {
                    pluginCookie[plugin] = enabled;
                    var cb = $("#"+plugin.replace(" ", "__"));
                    if(cb.is(":checked") && !enabled) {
                        bdplugins[plugin]["plugin"].stop();
                        cb.prop("checked", false);
                    }
                    if(!cb.is(":checked") && enabled) {
                        bdplugins[plugin]["plugin"].start();
                        cb.prop("checked", true);
                    }
                }
            });
            pluginModule.savePluginData();
        }catch(err) {
            mainCore.alert("Failed to load plugin data", err);
            return false;
        }

        try {
            themeCookie = obj.themes;
            $.each(themeCookie, function(theme) {
                var enabled = themeCookie[theme];
                var id = "#ti" + theme;
                if(bdthemes.hasOwnProperty(theme)) {
                    if($(id).is(":checked") && !enabled) {
                        $(id).prop("checked", false);
                        $("#"+theme).remove();
                    }
                    if(!$(id).is(":checked") && enabled) {
                        $(id).prop("checked", true);
                        $("head").append('<style id="' + theme + '">' + unescape(bdthemes[theme]["css"]) + '</style>');
                    }
                }
            });
            themeModule.saveThemeData();
        }catch(err) {
            mainCore.alert("Failed to load theme data", err);
            return false;
        }

        return false;
    });
};

Utils.prototype.exportSettings = function() {
    var obj =  {
        settings: settingsCookie,
        customCss: window.bdStorage.get("bdcustomcss"),
        plugins: pluginCookie,
        themes: themeCookie,
        favEmotes: window.bdStorage.get("bdfavemotes")
    };
    mainCore.alert("Export Settings", '<div class="form" style="width:100%;"><div class="control-group"><textarea style="min-height:150px;">'+JSON.stringify(obj)+'</textarea></div></div>');
};

Utils.prototype.addBackdrop = function(target) {
    var backDrop = $("<div/>", {
        class: "bda-backdrop",
        "data-bdbackdrop": target,
        mouseup: function() {
            $('[data-bdalert="'+target+'"]').remove();
            $(this).remove();
        }
    });
    $("#app-mount").append(backDrop)
};

Utils.prototype.removeBackdrop = function(target) {
    $('[data-bdbackdrop="'+target+'"]').remove();
};
/* BetterDiscordApp VoiceMode JavaScript
 * Version: 1.0
 * Author: Jiiks | http://jiiks.net
 * Date: 25/10/2015 - 19:10
 * https://github.com/Jiiks/BetterDiscordApp
 */

function VoiceMode() {

}

VoiceMode.prototype.obsCallback = function () {
    var self = this;
    if (settingsCookie["bda-gs-4"]) {
        self.disable();
        setTimeout(function () {
            self.enable();
        }, 300);
    }
};

VoiceMode.prototype.enable = function () {
    $(".scroller.guild-channels ul").first().css("display", "none");
    $(".scroller.guild-channels header").first().css("display", "none");
    $(".app.flex-vertical").first().css("overflow", "hidden");
    $(".chat.flex-vertical.flex-spacer").first().css("visibility", "hidden").css("min-width", "0px");
    $(".flex-vertical.channels-wrap").first().css("flex-grow", "100000");
    $(".guild-header .btn.btn-hamburger").first().css("visibility", "hidden");
};

VoiceMode.prototype.disable = function () {
    $(".scroller.guild-channels ul").first().css("display", "");
    $(".scroller.guild-channels header").first().css("display", "");
    $(".app.flex-vertical").first().css("overflow", "");
    $(".chat.flex-vertical.flex-spacer").first().css("visibility", "").css("min-width", "");
    $(".flex-vertical.channels-wrap").first().css("flex-grow", "");
    $(".guild-header .btn.btn-hamburger").first().css("visibility", "");
};
/* BetterDiscordApp PluginModule JavaScript
 * Version: 1.0
 * Author: Jiiks | http://jiiks.net
 * Date: 16/12/2015
 * https://github.com/Jiiks/BetterDiscordApp
 */

var pluginCookie = {};

function PluginModule() {

}

PluginModule.prototype.loadPlugins = function () {

    this.loadPluginData();

    $.each(bdplugins, function () {
        var plugin = this["plugin"];
        plugin.load();

        var name = plugin.getName();
        var enabled = false;

        if (pluginCookie.hasOwnProperty(name)) {
            enabled = pluginCookie[name];
        } else {
            pluginCookie[name] = false;
        }

        if (enabled) {
            plugin.start();
        }
    });
};

PluginModule.prototype.handlePlugin = function (checkbox) {

    var cb = $(checkbox).children().find('input[type="checkbox"]');
    var enabled = !cb.is(":checked");
    var id = cb.attr("id").replace("__", " ");
    cb.prop("checked", enabled);

    if (enabled) {
        bdplugins[id]["plugin"].start();
        pluginCookie[id] = true;
    } else {
        bdplugins[id]["plugin"].stop();
        pluginCookie[id] = false;
    }

    this.savePluginData();
};

PluginModule.prototype.handlePluginT = function(id, enabled) {

    if(enabled) {
        bdplugins[id]["plugin"].start();
        pluginCookie[id] = true;
    } else {
        bdplugins[id]["plugin"].stop();
        pluginCookie[id] = false;
    }

    this.savePluginData();
};

PluginModule.prototype.showSettings = function (plugin) {
    if (bdplugins[plugin] != null) {
        if (typeof bdplugins[plugin].plugin.getSettingsPanel === "function") {
            var panel = bdplugins[plugin].plugin.getSettingsPanel();

            $(".modal-inner").off("click.bdpsm").on("click.bdpsm", function (e) {
                if ($("#bd-psm-id").length) {
                    $(".bd-psm").remove();
                } else {
                    $(".bd-psm").attr("id", "bd-psm-id");
                }

            });
            $(".modal").append('<div class="bd-psm"><div class="scroller-wrap" style="height:100%"><div id="bd-psm-s" class="scroller" style="padding:10px;"></div></div></div>');
            $("#bd-psm-s").append(panel);
        }
    }
};

PluginModule.prototype.showSettingsT = function(plugin) {
    if(bdplugins[plugin] === null) return;
    if(typeof bdplugins[plugin].plugin.getSettingsPanel !== "function") return;

    $("#bd-settingspane").off("click.bdpsm").on("click.bdpsm", function(e) {
        if(e.target.id === 'bd-psm-s') return;
        if(e.target.textContent && e.target.textContent === 'Settings') return;
        $(".bd-psm").remove();
    });

    let panel = bdplugins[plugin].plugin.getSettingsPanel();

    $(".bd-settings-panes").append('<div class="bd-psm"><div class="scroller-wrap" style="height:100%"><div id="bd-psm-s" class="scroller" style="padding:10px;"></div></div></div>');
    $("#bd-psm-s").append(panel);

}

PluginModule.prototype.loadPluginData = function () {
    var cookie = $.cookie("bd-plugins");
    if (cookie != undefined) {
        pluginCookie = JSON.parse($.cookie("bd-plugins"));
    }
};

PluginModule.prototype.savePluginData = function () {
    $.cookie("bd-plugins", JSON.stringify(pluginCookie), {
        expires: 365,
        path: '/'
    });
};

PluginModule.prototype.newMessage = function () {
    $.each(bdplugins, function () {
        if (!pluginCookie[this.plugin.getName()]) return;
        if (typeof this.plugin.onMessage === "function") {
            this.plugin.onMessage();
        }
    });
};

PluginModule.prototype.channelSwitch = function () {
    $.each(bdplugins, function () {
        if (!pluginCookie[this.plugin.getName()]) return;
        if (typeof this.plugin.onSwitch === "function") {
            this.plugin.onSwitch();
        }
    });
};

PluginModule.prototype.socketEvent = function (e, data) {
    $.each(bdplugins, function () {
        if (!pluginCookie[this.plugin.getName()]) return;
        if (typeof this.plugin.socketEvent === "function") {
            this.plugin.socketEvent(data);
        }
    });
};

PluginModule.prototype.rawObserver = function(e) {
    $.each(bdplugins, function() {
        if (!pluginCookie[this.plugin.getName()]) return;
        if(typeof this.plugin.observer === "function") {
            this.plugin.observer(e);
        }
    });
};
/* BetterDiscordApp ThemeModule JavaScript
 * Version: 1.0
 * Author: Jiiks | http://jiiks.net
 * Date: 16/12/2015
 * https://github.com/Jiiks/BetterDiscordApp
 */

var themeCookie = {};

function ThemeModule() {

}

ThemeModule.prototype.loadThemes = function () {
    this.loadThemeData();

    $.each(bdthemes, function () {
        var name = this["name"];
        var enabled = false;
        if (themeCookie.hasOwnProperty(name)) {
            if (themeCookie[name]) {
                enabled = true;
            }
        } else {
            themeCookie[name] = false;
        }

        if (enabled) {
            $("head").append('<style id="' + name + '">' + unescape(bdthemes[name]["css"]) + '</style>');
        }
    });
};

ThemeModule.prototype.handleTheme = function (checkbox) {

    var cb = $(checkbox).children().find('input[type="checkbox"]');
    var enabled = !cb.is(":checked");
    var id = cb.attr("id").substring(2);
    cb.prop("checked", enabled);

    if (enabled) {
        $("head").append('<style id="' + id + '">' + unescape(bdthemes[id]["css"]) + '</style>');
        themeCookie[id] = true;
    } else {
        $("#" + id).remove();
        themeCookie[id] = false;
    }

    this.saveThemeData();
};

ThemeModule.prototype.handleThemeT = function(id, enabled) {

    if(enabled) {
        $("head").append('<style id="' + id + '">' + unescape(bdthemes[id]["css"]) + '</style>');
        themeCookie[id] = true;
    } else {
        $("#" + id).remove();
        themeCookie[id] = false;
    }

    this.saveThemeData();
};

ThemeModule.prototype.loadThemeData = function () {
    var cookie = $.cookie("bd-themes");
    if (cookie != undefined) {
        themeCookie = JSON.parse($.cookie("bd-themes"));
    }
};

ThemeModule.prototype.saveThemeData = function () {
    $.cookie("bd-themes", JSON.stringify(themeCookie), {
        expires: 365,
        path: '/'
    });
};
/*BDSocket*/

var bdSocket;
var bdws;

function BdWSocket() {
    bdws = this;
}

BdWSocket.prototype.start = function () {
    var self = this;
   /* $.ajax({
        method: "GET",
        url: "https://discordapp.com/api/gateway",
        headers: {
            authorization: localStorage.token.match(/\"(.+)\"/)[1]
        },
        success: function (data) {
            self.open(data.url);
        }
    });*/
};

BdWSocket.prototype.open = function (host) {
    utils.log("Socket Host: " + host);
    try {
        bdSocket = new WebSocket(host);
        bdSocket.onopen = this.onOpen;
        bdSocket.onmessage = this.onMessage;
        bdSocket.onerror = this.onError;
        bdSocket.onclose = this.onClose;
    } catch (err) {
        utils.log(err);
    }
};

BdWSocket.prototype.onOpen = function () {
    utils.log("Socket Open");
    var data = {
        op: 2,
        d: {
            token: JSON.parse(window.bdStorage.get('token')),
            properties: JSON.parse(window.bdStorage.get('superProperties')),
            v: 3
        }
    };
    bdws.send(data);
};

BdWSocket.prototype.onMessage = function (e) {

    var packet, data, type;
    try {
        packet = JSON.parse(e.data);
        data = packet.d;
        type = packet.t;
    } catch (err) {
        utils.err(err);
        return;
    }

    switch (type) {
    case "READY":
        bdSocket.interval = setInterval(function(){bdws.send({
            op: 1,
            d: Date.now()
        });}, data.heartbeat_interval);
        utils.log("Socket Ready");
        break;
    case "PRESENCE_UPDATE":
        pluginModule.socketEvent("PRESENCE_UPDATE", data);
        break;
    case "TYPING_START":
        pluginModule.socketEvent("TYPING_START", data);
        break;
    case "MESSAGE_CREATE":
        pluginModule.socketEvent("MESSAGE_CREATE", data);
        break;
    case "MESSAGE_UPDATE":
        pluginModule.socketEvent("MESSAGE_UPDATE", data);
        break;
    default:
        break;
    }

};

BdWSocket.prototype.onError = function (e) {
    utils.log("Socket Error - " + e.message);
};

BdWSocket.prototype.onClose = function (e) {
    utils.log("Socket Closed - " + e.code + " : " + e.reason);
    clearInterval(bdSocket.interval);
    bdws.start();
};

BdWSocket.prototype.send = function (data) {
    if (bdSocket.readyState == 1) {
        bdSocket.send(JSON.stringify(data));
    }
};

BdWSocket.prototype.getSocket = function () {
    return bdSocket;
};
/* BetterDiscordApp API for Plugins
 * Version: 1.0
 * Author: Jiiks | http://jiiks.net
 * Date: 11/12/2015
 * Last Update: 11/12/2015
 * https://github.com/Jiiks/BetterDiscordApp
 * 
 * Plugin Template: https://gist.github.com/Jiiks/71edd5af0beafcd08956
 */

function BdApi() {}

//Joins a server
//code = server invite code
BdApi.joinServer = function (code) {
    opublicServers.joinServer(code);
};

//Inject CSS to document head
//id = id of element
//css = custom css
BdApi.injectCSS = function (id, css) {
    $("head").append('<style id="' + id + '"></style>');
    $("#" + id).html(css);
};

//Clear css/remove any element
//id = id of element
BdApi.clearCSS = function (id) {
    $("#" + id).remove();
};

//Get another plugin
//name = name of plugin
BdApi.getPlugin = function (name) {
    if (bdplugins.hasOwnProperty(name)) {
        return bdplugins[name]["plugin"];
    }
    return null;
};

//Get ipc for reason
BdApi.getIpc = function () {
    return betterDiscordIPC;
};

//Get BetterDiscord Core
BdApi.getCore = function () {
    return mainCore;
};

//Attempts to get user id by username
//Name = username
//Since Discord hides users if there's too many, this will often fail
BdApi.getUserIdByName = function (name) {
    var users = $(".member-username");

    for (var i = 0; i < users.length; i++) {
        var user = $(users[i]);
        if (user.text() == name) {
            var avatarUrl = user.closest(".member").find(".avatar-small").css("background-image");
            return avatarUrl.match(/\d+/);
        }
    }
    return null;
};

//Attempts to get username by id
//ID = user id
//Since Discord hides users if there's too many, this will often fail
var gg;
BdApi.getUserNameById = function (id) {
    var users = $(".avatar-small");

    for (var i = 0; i < users.length; i++) {
        var user = $(users[i]);
        var url = user.css("background-image");
        if (id == url.match(/\d+/)) {
            return user.parent().find(".member-username").text();
        }
    }
    return null;
};

//Set current game
//game = game
BdApi.setPlaying = function (game) {
    bdws.send({
        "op": 3,
        "d": {
            "idle_since": null,
            "game": {
                "name": game
            }
        }
    });
};

//Set current status
//idle_since = date
//status = status
BdApi.setStatus = function (idle_since, status) {
    bdws.send({
        "op": 3,
        "d": {
            "idle_since": idle_since,
            "game": {
                "name": status
            }
        }
    });
};
/* BetterDiscordApp DevMode JavaScript
 * Version: 1.0
 * Author: Jiiks | http://jiiks.net
 * Date: 22/05/2016
 * Last Update: 22/05/2016
 * https://github.com/Jiiks/BetterDiscordApp
 */
 
 function devMode() {}
 
 devMode.prototype.enable = function() {
     var self = this;
     $(window).on("keydown.bdDevmode", function(e) {
         if(e.which === 119) {//F8
            console.log('%c[%cDM%c] %cBreak/Resume', 'color: red;', 'color: #303030; font-weight:700;', 'color:red;', '');
            debugger;
         }
     });
     /*
     $(window).on("mousedown.bdDevmode", function(e) {
         if(e.which !== 3) return;
         var parents = [];
         $(e.toElement).parents().addBack().not('html').each(function() {
             var entry = "";
             if(this.className) {
                 entry += "." + this.className.trim().replace(/ /g, ".");
                 parents.push(entry);
             }
         });
         self.lastSelector = parents.join(" ").trim();

         function attach() {
            var cm = $(".context-menu");
            if(cm.length <= 0) {
                return;
                cm = $("body").append('<div class="context-menu"></div>');
            }
            
            var cmo = $("<div/>", {
                class: "item-group"
            });
            var cmi = $("<div/>", {
                class: "item",
                click: function() {
                    var t = $("<textarea/>", { text: self.lastSelector }).appendTo("body");
                    t.select();
                    document.execCommand("copy");
                    t.remove();
                    cm.remove();
                }
            }).append($("<span/>", { text: "Copy Selector" }));
            cmo.append(cmi);
            cm.append(cmo);
            cm.css("top", (cm.css("top").replace("px", "") - 28) + "px");
         }
         
         setTimeout(attach, 100);
         
         e.stopPropagation();
     });
     */
 };
 
 devMode.prototype.disable = function() {
     $(window).off("keydown.bdDevmode");
     $(window).off("mousedown.bdDevmode")
 };



/*V2 Premature*/

window.bdtemp = {
    'editorDetached': false
};

class V2 {

    constructor() {
        this.internal = {
            'react': require('react'),
            'react-dom': require('react-dom')
        };
    }

    get reactComponent() {
        return this.internal['react'].Component;
    }

    get react() {
        return this.internal['react'];
    }

    get reactDom() {
        return this.internal['react-dom'];
    }

    parseSettings(cat) {
        return Object.keys(settings).reduce((arr, key) => { 
            let setting = settings[key];
            if(setting.cat === cat && setting.implemented && !setting.hidden) { 
                setting.text = key;
                arr.push(setting) 
            } return arr; 
        }, []);
    }


}
window.BDV2 = new V2();

class V2C_SettingsPanel extends BDV2.reactComponent {

    constructor(props) {
        super(props);
    }

    render() {
        let { settings } = this.props;
        return BDV2.react.createElement(
            "div",
            { className: "content-column default" },
            BDV2.react.createElement(V2Components.SettingsTitle, { text: this.props.title }),
            settings.map(setting => {
                return BDV2.react.createElement(V2Components.Switch, { id: setting.id, key: setting.id, data: setting, checked: settingsCookie[setting.id], onChange: (id, checked) => {
                        this.props.onChange(id, checked);
                    } });
            })
        );
    }
}

class V2C_Switch extends BDV2.reactComponent {

    constructor(props) {
        super(props);
        this.setInitialState();
        this.onChange = this.onChange.bind(this);
    }

    setInitialState() {
        this.state = {
            'checked': this.props.checked
        };
    }

    render() {
        let { text, info } = this.props.data;
        let { checked } = this.state;
        return BDV2.react.createElement(
            "div",
            { className: "ui-flex flex-vertical flex-justify-start flex-align-stretch flex-nowrap ui-switch-item" },
            BDV2.react.createElement(
                "div",
                { className: "ui-flex flex-horizontal flex-justify-start flex-align-stretch flex-nowrap" },
                BDV2.react.createElement(
                    "h3",
                    { className: "ui-form-title h3 margin-reset margin-reset ui-flex-child" },
                    text
                ),
                BDV2.react.createElement(
                    "label",
                    { className: "ui-switch-wrapper ui-flex-child", style: { flex: '0 0 auto' } },
                    BDV2.react.createElement("input", { className: "ui-switch-checkbox", type: "checkbox", checked: checked, onChange: e => this.onChange(e) }),
                    BDV2.react.createElement("div", { className: "ui-switch" })
                )
            ),
            BDV2.react.createElement(
                "div",
                { className: "ui-form-text style-description margin-top-4", style: { flex: '1 1 auto' } },
                info
            )
        );
    }

    onChange(e) {
        this.props.onChange(this.props.id, !this.state.checked);
        this.setState({
            'checked': !this.state.checked
        });
    }
}

class V2C_Scroller extends BDV2.reactComponent {

    constructor(props) {
        super(props);
    }

    render() {
        let wrapperClass = `scroller-wrap${this.props.fade ? ' fade' : ''} ${this.props.dark ? ' dark' : ''}`;
        let { children } = this.props;
        return BDV2.react.createElement(
            "div",
            { key: "scrollerwrap", className: wrapperClass },
            BDV2.react.createElement(
                "div",
                { key: "scroller", ref: "scroller", className: "scroller" },
                children
            )
        );
    }
}

class V2C_TabBarItem extends BDV2.reactComponent {

    constructor(props) {
        super(props);
        this.setInitialState();
        this.onClick = this.onClick.bind(this);
    }

    setInitialState() {
        this.state = {
            'selected': this.props.selected || false
        };
    }

    render() {
        return BDV2.react.createElement(
            "div",
            { className: `ui-tab-bar-item${this.props.selected ? ' selected' : ''}`, onClick: this.onClick },
            this.props.text
        );
    }

    onClick() {

        if (this.props.onClick) {
            this.props.onClick(this.props.id);
        }
    }
}

class V2C_TabBarSeparator extends BDV2.reactComponent {
    constructor(props) {
        super(props);
    }

    render() {
        return BDV2.react.createElement("div", { className: "ui-tab-bar-separator margin-top-8 margin-bottom-8" });
    }
}

class V2C_TabBarHeader extends BDV2.reactComponent {
    constructor(props) {
        super(props);
    }

    render() {
        return BDV2.react.createElement(
            "div",
            { className: "ui-tab-bar-header" },
            this.props.text
        );
    }
}

class V2C_SideBar extends BDV2.reactComponent {

    constructor(props) {
        super(props);
        let self = this;
        $('.ui-tab-bar-item').on('click', e => {
            self.setState({
                'selected': null
            });
        });
        self.setInitialState();
        self.onClick = self.onClick.bind(self);
    }

    setInitialState() {
        let self = this;
        self.state = {
            'selected': null,
            'items': self.props.items
        };

        let initialSelection = self.props.items.find(item => {
            return item.selected;
        });
        if (initialSelection) {
            self.state.selected = initialSelection.id;
        }
    }

    render() {
        let self = this;
        let { headerText } = self.props;
        let { items, selected } = self.state;
        return BDV2.react.createElement(
            "div",
            null,
            BDV2.react.createElement(V2Components.TabBar.Separator, null),
            BDV2.react.createElement(V2Components.TabBar.Header, { text: headerText }),
            items.map(item => {
                let { id, text } = item;
                return BDV2.react.createElement(V2Components.TabBar.Item, { key: id, selected: selected === id, text: text, id: id, onClick: self.onClick });
            })
        );
    }

    onClick(id) {
        let self = this;
        $('.ui-tab-bar-item').removeClass('selected');
        self.setState({
            'selected': id
        });

        if (self.props.onClick) self.props.onClick(id);
    }
}

class V2C_XSvg extends BDV2.reactComponent {
    constructor(props) {
        super(props);
    }

    render() {
        return BDV2.react.createElement(
            "svg",
            { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 12 12", style: { width: "18px", height: "18px" } },
            BDV2.react.createElement(
                "g",
                { className: "background", fill: "none", "fill-rule": "evenodd" },
                BDV2.react.createElement("path", { d: "M0 0h12v12H0" }),
                BDV2.react.createElement("path", { className: "fill", fill: "#dcddde", d: "M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6" })
            )
        );
    }
}

class V2C_Tools extends BDV2.reactComponent {

    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    render() {
        return BDV2.react.createElement(
            "div",
            { className: "tools" },
            BDV2.react.createElement(
                "div",
                { className: "btn-close", onClick: this.onClick },
                BDV2.react.createElement(V2Components.XSvg, null)
            ),
            BDV2.react.createElement(
                "div",
                { className: "esc-text" },
                "ESC"
            )
        );
    }

    onClick() {
        if (this.props.onClick) {
            this.props.onClick();
        }
        $(".btn-close").first().click();
    }
}

class V2C_SettingsTitle extends BDV2.reactComponent {
    constructor(props) {
        super(props);
    }

    render() {
        return BDV2.react.createElement(
            "h2",
            { className: "ui-form-title h2 margin-reset margin-bottom-20" },
            this.props.text
        );
    }
}

class V2C_Checkbox extends BDV2.reactComponent {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
        this.setInitialState();
    }

    setInitialState() {
        this.state = {
            'checked': this.props.checked || false
        };
    }

    render() {
        return BDV2.react.createElement(
            "li",
            null,
            BDV2.react.createElement(
                "div",
                { className: "checkbox", onClick: this.onClick },
                BDV2.react.createElement(
                    "div",
                    { className: "checkbox-inner" },
                    BDV2.react.createElement("input", { checked: this.state.checked, onChange: () => {}, type: "checkbox" }),
                    BDV2.react.createElement("span", null)
                ),
                BDV2.react.createElement(
                    "span",
                    null,
                    this.props.text
                )
            )
        );
    }

    onClick() {
        this.props.onChange(this.props.id, !this.state.checked);
        this.setState({
            'checked': !this.state.checked
        });
    }
}

class V2C_CssEditorDetached extends BDV2.reactComponent {

    constructor(props) {
        super(props);
        let self = this;
        self.onClick = self.onClick.bind(self);
        self.updateCss = self.updateCss.bind(self);
        self.saveCss = self.saveCss.bind(self);
        self.onChange = self.onChange.bind(self);
    }

    componentDidMount() {
        let self = this;
        $("#app-mount").addClass('bd-detached-editor');
        self.editor = CodeMirror.fromTextArea(self.refs.editor, self.options);
        self.editor.on("change", cm => {
            if (!settingsCookie["bda-css-0"]) return;
            self.updateCss();
        });
        window.bdtemp.editorDetached = true;
    }

    componentWillUnmount() {
        $("#app-mount").removeClass('bd-detached-editor');
        window.bdtemp.editorDetached = false;
    }

    get options() {
        return {
            lineNumbers: true,
            mode: 'css',
            indentUnit: 4,
            theme: 'material',
            scrollbarStyle: 'simple'
        };
    }

    get css() {
        let _ccss = window.bdStorage.get("bdcustomcss");
        let ccss = "";
        if (_ccss && _ccss !== "") {
            ccss = atob(_ccss);
        }
        return ccss;
    }

    get root() {
        let _root = $("#bd-customcss-detach-container");
        if (!_root.length) {
            if (!this.injectRoot()) return null;
            return this.detachedRoot;
        }
        return _root[0];
    }

    injectRoot() {
        if (!$(".app").length) return false;
        $("<div/>", {
            id: 'bd-customcss-detach-container'
        }).insertAfter($(".app"));
        return true;
    }

    render() {
        let self = this;
        return BDV2.react.createElement(
            "div",
            { className: "bd-detached-css-editor", id: "bd-customcss-detach-editor" },
            BDV2.react.createElement(
                "div",
                { id: "bd-customcss-innerpane" },
                BDV2.react.createElement("textarea", { onChange: () => {}, value: self.css, ref: "editor", id: "bd-customcss-ta" }),
                BDV2.react.createElement(
                    "div",
                    { id: "bd-customcss-attach-controls" },
                    BDV2.react.createElement(
                        "ul",
                        { className: "checkbox-group" },
                        BDV2.react.createElement(V2Components.Checkbox, { id: "live-update", text: "Live Update", onChange: self.onChange, checked: settingsCookie["bda-css-0"] })
                    ),
                    BDV2.react.createElement(
                        "div",
                        { id: "bd-customcss-detach-controls-button" },
                        BDV2.react.createElement(
                            "button",
                            { style: { borderRadius: "3px 0 0 3px", borderRight: "1px solid #3f4146" }, className: "btn btn-primary", onClick: () => {
                                    self.onClick("update");
                                } },
                            "Update"
                        ),
                        BDV2.react.createElement(
                            "button",
                            { style: { borderRadius: "0", borderLeft: "1px solid #2d2d2d", borderRight: "1px solid #2d2d2d" }, className: "btn btn-primary", onClick: () => {
                                    self.onClick("save");
                                } },
                            "Save"
                        ),
                        BDV2.react.createElement(
                            "button",
                            { style: { borderRadius: "0 3px 3px 0", borderLeft: "1px solid #3f4146" }, className: "btn btn-primary", onClick: () => {
                                    self.onClick("attach");
                                } },
                            "Attach"
                        ),
                        BDV2.react.createElement(
                            "span",
                            { style: { fontSize: "10px", marginLeft: "5px" } },
                            "Unsaved changes are lost on attach"
                        )
                    )
                )
            )
        );
    }

    onChange(id, checked) {
        switch (id) {
            case 'live-update':
                settingsCookie["bda-css-0"] = checked;
                mainCore.saveSettings();
                break;
        }
    }

    onClick(id) {
        let self = this;
        switch (id) {
            case 'attach':
                if ($("#editor-detached").length) self.props.attach();
                BDV2.reactDom.unmountComponentAtNode(self.root);
                break;
            case 'update':
                self.updateCss();
                break;
            case 'save':
                self.saveCss();
                break;
        }
    }

    updateCss() {
        let self = this;
        if ($("#customcss").length == 0) {
            $("head").append('<style id="customcss"></style>');
        }
        $("#customcss").html(self.editor.getValue());
    }

    saveCss() {
        let self = this;
        window.bdStorage.set("bdcustomcss", btoa(self.editor.getValue()));
    }
}

class V2C_CssEditor extends BDV2.reactComponent {

    constructor(props) {
        super(props);
        let self = this;
        self.setInitialState();
        self.attach = self.attach.bind(self);
        self.detachedEditor = BDV2.react.createElement(V2C_CssEditorDetached, { attach: self.attach });
        self.onClick = self.onClick.bind(self);
        self.updateCss = self.updateCss.bind(self);
        self.saveCss = self.saveCss.bind(self);
        self.detach = self.detach.bind(self);
        self.codeMirror = self.codeMirror.bind(self);
    }

    setInitialState() {
        this.state = {
            'detached': this.props.detached || window.bdtemp.editorDetached
        };
    }

    componentDidMount() {
        let self = this;
        self.codeMirror();
    }

    componentDidUpdate(prevProps, prevState) {
        let self = this;
        if (prevState.detached && !self.state.detached) {
            BDV2.reactDom.unmountComponentAtNode(self.detachedRoot);
            self.codeMirror();
        }
    }

    codeMirror() {
        let self = this;
        if (!self.state.detached) {
            self.editor = CodeMirror.fromTextArea(self.refs.editor, self.options);
            self.editor.on("change", cm => {
                if (!settingsCookie["bda-css-0"]) return;
                self.updateCss();
            });
        }
    }

    get options() {
        return {
            lineNumbers: true,
            mode: 'css',
            indentUnit: 4,
            theme: 'material',
            scrollbarStyle: 'simple'
        };
    }

    get css() {
        let _ccss = window.bdStorage.get("bdcustomcss");
        let ccss = "";
        if (_ccss && _ccss !== "") {
            ccss = atob(_ccss);
        }
        return ccss;
    }

    render() {
        let self = this;

        let { detached } = self.state;
        return BDV2.react.createElement(
            "div",
            { className: "content-column default", style: { padding: '60px 40px 0px' } },
            detached && BDV2.react.createElement(
                "div",
                { id: "editor-detached" },
                BDV2.react.createElement(V2Components.SettingsTitle, { text: "Custom CSS Editor" }),
                BDV2.react.createElement(
                    "h3",
                    null,
                    "Editor Detached"
                ),
                BDV2.react.createElement(
                    "button",
                    { className: "btn btn-primary", onClick: () => {
                            self.attach();
                        } },
                    "Attach"
                )
            ),
            !detached && BDV2.react.createElement(
                "div",
                null,
                BDV2.react.createElement(V2Components.SettingsTitle, { text: "Custom CSS Editor" }),
                BDV2.react.createElement("textarea", { ref: "editor", value: self.css, onChange: () => {} }),
                BDV2.react.createElement(
                    "div",
                    { id: "bd-customcss-attach-controls" },
                    BDV2.react.createElement(
                        "ul",
                        { className: "checkbox-group" },
                        BDV2.react.createElement(V2Components.Checkbox, { id: "live-update", text: "Live Update", onChange: this.onChange, checked: settingsCookie["bda-css-0"] })
                    ),
                    BDV2.react.createElement(
                        "div",
                        { id: "bd-customcss-detach-controls-button" },
                        BDV2.react.createElement(
                            "button",
                            { style: { borderRadius: "3px 0 0 3px", borderRight: "1px solid #3f4146" }, className: "btn btn-primary", onClick: () => {
                                    self.onClick("update");
                                } },
                            "Update"
                        ),
                        BDV2.react.createElement(
                            "button",
                            { style: { borderRadius: "0", borderLeft: "1px solid #2d2d2d", borderRight: "1px solid #2d2d2d" }, className: "btn btn-primary", onClick: () => {
                                    self.onClick("save");
                                } },
                            "Save"
                        ),
                        BDV2.react.createElement(
                            "button",
                            { style: { borderRadius: "0 3px 3px 0", borderLeft: "1px solid #3f4146" }, className: "btn btn-primary", onClick: () => {
                                    self.onClick("detach");
                                } },
                            "Detach"
                        ),
                        BDV2.react.createElement(
                            "span",
                            { style: { fontSize: "10px", marginLeft: "5px" } },
                            "Unsaved changes are lost on detach"
                        )
                    )
                )
            )
        );
    }

    onClick(arg) {
        let self = this;
        switch (arg) {
            case 'update':
                self.updateCss();
                break;
            case 'save':
                self.saveCss();
                break;
            case 'detach':
                self.detach();
                break;
        }
    }

    onChange(id, checked) {
        switch (id) {
            case 'live-update':
                settingsCookie["bda-css-0"] = checked;
                mainCore.saveSettings();
                break;
        }
    }

    updateCss() {
        let self = this;
        if ($("#customcss").length == 0) {
            $("head").append('<style id="customcss"></style>');
        }
        $("#customcss").html(self.editor.getValue());
    }

    saveCss() {
        let self = this;
        window.bdStorage.set("bdcustomcss", btoa(self.editor.getValue()));
    }

    detach() {
        let self = this;
        self.setState({
            'detached': true
        });
        let droot = self.detachedRoot;
        if (!droot) {
            console.log("FAILED TO INJECT ROOT: .app");
            return;
        }
        BDV2.reactDom.render(self.detachedEditor, droot);
    }

    get detachedRoot() {
        let _root = $("#bd-customcss-detach-container");
        if (!_root.length) {
            if (!this.injectDetachedRoot()) return null;
            return this.detachedRoot;
        }
        return _root[0];
    }

    injectDetachedRoot() {
        if (!$(".app").length) return false;
        $("<div/>", {
            id: 'bd-customcss-detach-container'
        }).insertAfter($(".app"));
        return true;
    }

    attach() {
        let self = this;
        self.setState({
            'detached': false
        });
    }
}

class V2C_List extends BDV2.reactComponent {
    constructor(props) {
        super(props);
    }

    render() {
        return BDV2.react.createElement(
            "ul",
            { className: this.props.className },
            this.props.children
        );
    }
}

class V2C_ContentColumn extends BDV2.reactComponent {
    constructor(props) {
        super(props);
    }

    render() {
        return BDV2.react.createElement(
            "div",
            { className: "content-column default" },
            BDV2.react.createElement(
                "h2",
                { className: "ui-form-title h2 margin-reset margin-bottom-20" },
                this.props.title
            ),
            this.props.children
        );
    }
}

class V2C_PluginCard extends BDV2.reactComponent {

    constructor(props) {
        super(props);
        let self = this;
        if (typeof self.props.plugin.getSettingsPanel === "function") {
            self.settingsPanel = self.props.plugin.getSettingsPanel();
        }
        self.onChange = self.onChange.bind(self);
        self.showSettings = self.showSettings.bind(self);
        self.setInitialState();
    }

    setInitialState() {
        this.state = {
            'checked': pluginCookie[this.props.plugin.getName()],
            'settings': false
        };
    }

    componentDidUpdate() {
        if (this.state.settings) {
            if (typeof this.settingsPanel === "object") {
                this.refs.settingspanel.appendChild(this.settingsPanel);
            }
        }
    }

    render() {
        let self = this;
        let { plugin } = this.props;
        let name = plugin.getName();
        let author = plugin.getAuthor();
        let description = plugin.getDescription();
        let version = plugin.getVersion();
        let { settingsPanel } = this;

        if (this.state.settings) {
            return BDV2.react.createElement(
                "li",
                { style: { maxHeight: "500px", overflow: "auto" } },
                BDV2.react.createElement(
                    "div",
                    { style: { float: "right", cursor: "pointer" }, onClick: () => {
                            this.refs.settingspanel.innerHTML = "";self.setState({ 'settings': false });
                        } },
                    BDV2.react.createElement(V2Components.XSvg, null)
                ),
                typeof settingsPanel === 'object' && BDV2.react.createElement("div", { ref: "settingspanel" }),
                typeof settingsPanel !== 'object' && BDV2.react.createElement("div", { ref: "settingspanel", dangerouslySetInnerHTML: { __html: plugin.getSettingsPanel() } })
            );
        }

        return BDV2.react.createElement(
            "li",
            null,
            BDV2.react.createElement(
                "div",
                { className: "bda-left" },
                BDV2.react.createElement(
                    "span",
                    { className: "bda-name" },
                    name,
                    " v",
                    version,
                    " by ",
                    author
                ),
                BDV2.react.createElement(
                    "div",
                    { className: "scroller-wrap fade" },
                    BDV2.react.createElement(
                        "div",
                        { className: "scroller bda-description" },
                        description
                    )
                )
            ),
            BDV2.react.createElement(
                "div",
                { className: "bda-right" },
                BDV2.react.createElement(
                    "label",
                    { className: "ui-switch-wrapper ui-flex-child", style: { flex: '0 0 auto' } },
                    BDV2.react.createElement("input", { checked: this.state.checked, onChange: this.onChange, className: "ui-switch-checkbox", type: "checkbox" }),
                    BDV2.react.createElement("div", { className: "ui-switch" })
                ),
                this.settingsPanel && BDV2.react.createElement(
                    "button",
                    { onClick: this.showSettings },
                    "Settings"
                )
            )
        );
    }

    onChange() {
        let self = this;
        self.setState({
            'checked': !self.state.checked
        });
        pluginCookie[self.props.plugin.getName()] = !self.state.checked;
        if (!self.state.checked) {
            self.props.plugin.start();
        } else {
            self.props.plugin.stop();
        }
        $.cookie("bd-plugins", JSON.stringify(pluginCookie), {
            expires: 365,
            path: '/'
        });
    }

    showSettings() {
        if (!this.settingsPanel) return;
        this.setState({
            'settings': true
        });
    }
}

class V2C_ThemeCard extends BDV2.reactComponent {

    constructor(props) {
        super(props);
        this.setInitialState();
        this.onChange = this.onChange.bind(this);
    }

    setInitialState() {
        this.state = {
            'checked': themeCookie[this.props.theme.name]
        };
    }

    render() {
        let { theme } = this.props;
        let name = theme.name.replace('_', ' ');
        let description = theme.description;
        let version = theme.version;
        let author = theme.author;
        return BDV2.react.createElement(
            "li",
            null,
            BDV2.react.createElement(
                "div",
                { className: "bda-left" },
                BDV2.react.createElement(
                    "span",
                    { className: "bda-name" },
                    name,
                    " v",
                    version,
                    " by ",
                    author
                ),
                BDV2.react.createElement(
                    "div",
                    { className: "scroller-wrap fade" },
                    BDV2.react.createElement(
                        "div",
                        { className: "scroller bda-description" },
                        description
                    )
                )
            ),
            BDV2.react.createElement(
                "div",
                { className: "bda-right" },
                BDV2.react.createElement(
                    "label",
                    { className: "ui-switch-wrapper ui-flex-child", style: { flex: '0 0 auto' } },
                    BDV2.react.createElement("input", { checked: this.state.checked, onChange: this.onChange, className: "ui-switch-checkbox", type: "checkbox" }),
                    BDV2.react.createElement("div", { className: "ui-switch" })
                )
            )
        );
    }

    onChange() {
        let self = this;
        self.setState({
            'checked': !self.state.checked
        });
        themeCookie[self.props.theme.name] = !self.state.checked;
        if (!self.state.checked) {
            $("head").append(`<style id="${self.props.theme.name}">${unescape(self.props.theme.css)}</style>`);
        } else {
            $(`#${self.props.theme.name}`).remove();
        }
        $.cookie("bd-themes", JSON.stringify(themeCookie), {
            expires: 365,
            path: '/'
        });
    }
}

class V2Cs_TabBar {
    static get Item() {
        return V2C_TabBarItem;
    }
    static get Header() {
        return V2C_TabBarHeader;
    }
    static get Separator() {
        return V2C_TabBarSeparator;
    }
}

class V2C_Layer extends BDV2.reactComponent {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        $(window).on(`keyup.${this.props.id}`, e => {
            if (e.which === 27) {
                BDV2.reactDom.unmountComponentAtNode(this.refs.root.parentNode);
            }
        });
    }

    componentWillUnmount() {
        $(window).off(`keyup.${this.props.id}`);
        $(`#${this.props.rootId}`).remove();
    }

    render() {
        return BDV2.react.createElement(
            "div",
            { className: "layer", id: this.props.id, ref: "root" },
            this.props.children
        );
    }
}

class V2C_SidebarView extends BDV2.reactComponent {

    constructor(props) {
        super(props);
    }

    render() {
        let { sidebar, content } = this.props.children;
        return BDV2.react.createElement(
            "div",
            { className: "ui-standard-sidebar-view" },
            BDV2.react.createElement(
                "div",
                { className: "sidebar-region" },
                BDV2.react.createElement(V2Components.Scroller, { key: "sidebarScroller", ref: "sidebarScroller", fade: sidebar.fade || true, dark: sidebar.dark || true, children: sidebar.component })
            ),
            BDV2.react.createElement(
                "div",
                { className: "content-region" },
                BDV2.react.createElement(V2Components.Scroller, { key: "contentScroller", ref: "contentScroller", fade: content.fade || true, dark: content.dark || true, children: content.component })
            )
        );
    }
}

class V2C_ServerCard extends BDV2.reactComponent {
    constructor(props) {
        super(props);
    }

    render() {
        let { server } = this.props;

        return BDV2.react.createElement(
            "div",
            { className: `ui-card ui-card-primary bd-server-card${server.pinned ? ' bd-server-card-pinned' : ''}`, style: { marginTop: "5px" } },
            BDV2.react.createElement(
                "div",
                { className: "ui-flex horizontal", style: { display: "flex", flexFlow: "row nowrap", justifyContent: "flex-start", alignItems: "stretch", flex: "1 1 auto" } },
                BDV2.react.createElement(
                    "div",
                    { className: "ui-flex-child", style: { flex: "0 1 auto", padding: "5px" } },
                    BDV2.react.createElement("div", { className: "bd-pubs-server-icon", style: { width: "100px", height: "100px", backgroundSize: "cover", backgroundImage: `url(${server.icon})` } })
                ),
                BDV2.react.createElement(
                    "div",
                    { className: "ui-flex-child", style: { flex: "1 1 auto", padding: "5px" } },
                    BDV2.react.createElement(
                        "div",
                        { className: "ui-flex horizontal" },
                        BDV2.react.createElement(
                            "div",
                            { className: "ui-form-item", style: { flex: "1 1 auto" } },
                            BDV2.react.createElement(
                                "h5",
                                { className: "ui-form-title h5 margin-reset" },
                                server.name
                            )
                        ),
                        BDV2.react.createElement(
                            "div",
                            { className: "ui-form-item" },
                            BDV2.react.createElement(
                                "h5",
                                { className: "ui-form-title h5 margin-reset" },
                                server.online,
                                "/",
                                server.members,
                                " Members"
                            )
                        )
                    ),
                    BDV2.react.createElement(
                        "div",
                        { className: "ui-flex horizontal" },
                        BDV2.react.createElement(
                            "div",
                            { className: "scroller-wrap fade dark", style: { minHeight: "60px", maxHeight: "60px", borderTop: "1px solid #3f4146", borderBottom: "1px solid #3f4146", paddingTop: "5px" } },
                            BDV2.react.createElement(
                                "div",
                                { className: "scroller" },
                                BDV2.react.createElement(
                                    "div",
                                    { style: { fontSize: "13px", color: "#b9bbbe" } },
                                    server.description
                                )
                            )
                        )
                    ),
                    BDV2.react.createElement(
                        "div",
                        { className: "ui-flex horizontal" },
                        BDV2.react.createElement(
                            "div",
                            { className: "ui-flex-child bd-server-tags", style: { flex: "1 1 auto" } },
                            server.categories.join(', ')
                        ),
                        server.joined && BDV2.react.createElement(
                            "button",
                            { type: "button", className: "ui-button filled brand small grow disabled", style: { minHeight: "12px", marginTop: "4px", backgroundColor: "#3ac15c" } },
                            BDV2.react.createElement(
                                "div",
                                { className: "ui-button-contents" },
                                "Joined"
                            )
                        ),
                        server.error && BDV2.react.createElement(
                            "button",
                            { type: "button", className: "ui-button filled brand small grow disabled", style: { minHeight: "12px", marginTop: "4px", backgroundColor: "#c13a3a" } },
                            BDV2.react.createElement(
                                "div",
                                { className: "ui-button-contents" },
                                "Error"
                            )
                        ),
                        !server.error && !server.joined && BDV2.react.createElement(
                            "button",
                            { type: "button", className: "ui-button filled brand small grow", style: { minHeight: "12px", marginTop: "4px" }, onClick: () => {
                                    this.join(server.identifier);
                                } },
                            BDV2.react.createElement(
                                "div",
                                { className: "ui-button-contents" },
                                "Join"
                            )
                        )
                    )
                )
            )
        );
    }

    join(id) {
        let self = this;
        self.props.join(self.props.server);
    }
}

class V2C_PublicServers extends BDV2.reactComponent {

    constructor(props) {
        super(props);
        this.setInitialState();
        this.close = this.close.bind(this);
        this.changeCategory = this.changeCategory.bind(this);
        this.search = this.search.bind(this);
        this.searchKeyDown = this.searchKeyDown.bind(this);
        this.checkConnection = this.checkConnection.bind(this);
        this.join = this.join.bind(this);
        this.connect = this.connect.bind(this);
    }

    componentDidMount() {
        this.checkConnection();
    }

    setInitialState() {
        this.state = {
            'selectedCategory': -1,
            'title': 'Loading...',
            'loading': true,
            'servers': [],
            'next': null,
            'connection': {
                'state': 0,
                'user': null
            }
        };
    }

    close() {
        BDV2.reactDom.unmountComponentAtNode(document.getElementById(this.props.rootId));
    }

    search(query, clear) {
        let self = this;

        $.ajax({
            method: 'GET',
            url: `${self.endPoint}${query}`,
            success: data => {

                let servers = data.results.reduce((arr, server) => {
                    server.joined = false;
                    arr.push(server);
                    // arr.push(<V2Components.ServerCard server={server} join={self.join}/>);
                    return arr;
                }, []);

                if (!clear) {
                    servers = self.state.servers.concat(servers);
                } else {
                    //servers.unshift(self.bdServer);
                }

                let end = data.size + data.from;
                if (end >= data.total) {
                    end = data.total;
                    data.next = null;
                }

                let title = `Showing 1-${end} of ${data.total} results in ${self.categoryButtons[self.state.selectedCategory]}`;
                if (self.state.term) title += ` for ${self.state.term}`;

                self.setState({
                    'loading': false,
                    'title': title,
                    'servers': servers,
                    'next': data.next
                });

                if (clear) {
                    self.refs.sbv.refs.contentScroller.refs.scroller.scrollTop = 0;
                }
            },
            error: (jqXHR, textStatus, errorThrow) => {
                self.setState({
                    'loading': false,
                    'title': 'Failed to load servers. Check console for details'
                });
                console.log(jqXHR);
            }
        });
    }

    join(server) {
        let self = this;
        if (self.state.loading) return;
        self.setState({
            'loading': true
        });

        if (server.nativejoin) {
            self.setState({
                'loading': false
            });
            $(".guilds-add").click();
            $(".join .btn-primary").click();
            $(".join-server input").val(server.invitecode);
            return;
        }

        $.ajax({
            method: 'GET',
            url: `${self.joinEndPoint}/${server.identifier}`,
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
            success: data => {
                let servers = self.state.servers;
                servers.map(s => {
                    if (s.identifier === server.identifier) server.joined = true;
                });
                self.setState({
                    'loading': false,
                    'servers': servers
                });
            },
            error: jqXHR => {
                console.log(`[BetterDiscord] Failed to join server ${server.name}. Reason: `);
                console.log(jqXHR);
                let servers = self.state.servers;
                servers.map(s => {
                    if (s.identifier === server.identifier) server.error = true;
                });
                self.setState({
                    'loading': false,
                    'servers': servers
                });
            }
        });
    }

    get bdServer() {
        let server = {
            "name": "BetterDiscord",
            "online": "7500+",
            "members": "20000+",
            "categories": ["community", "programming", "support"],
            "description": "Official BetterDiscord server for support etc",
            "identifier": "86004744966914048",
            "icon": "https://cdn.discordapp.com/icons/86004744966914048/c8d49dc02248e1f55caeb897c3e1a26e.png",
            "nativejoin": true,
            "invitecode": "0Tmfo5ZbORCRqbAd",
            "pinned": true
        };
        return BDV2.react.createElement(V2Components.ServerCard, { server: server, pinned: true, join: this.join });
    }

    get endPoint() {
        return 'https://search.discordservers.com';
    }

    get joinEndPoint() {
        return 'https://join.discordservers.com';
    }

    get connectEndPoint() {
        return 'https://join.discordservers.com/connect';
    }

    checkConnection() {
        let self = this;
        $.ajax({
            method: 'GET',
            url: `${self.joinEndPoint}/session`,
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
            success: data => {
                self.setState({
                    'selectedCategory': 0,
                    'connection': {
                        'state': 2,
                        'user': data
                    }
                });
                self.search("", true);
            },
            error: jqXHR => {
                if (jqXHR.status === 403) {
                    //Not connected
                    self.setState({
                        'title': 'Not connected to discordservers.com!',
                        'loading': true,
                        'selectedCategory': -1,
                        'connection': {
                            'state': 1,
                            'user': null
                        }
                    });
                    return;
                }
                console.log(jqXHR);
            }
        });
    }

    get windowOptions() {
        return {
            width: 520,
            height: 710,
            backgroundColor: '#282b30',
            show: true,
            resizable: false,
            maximizable: false,
            minimizable: false,
            alwaysOnTop: true,
            frame: false,
            center: false
        };
    }

    connect() {
        let self = this;
        let options = self.windowOptions;
        options.x = Math.round(window.screenX + window.innerWidth / 2 - options.width / 2);
        options.y = Math.round(window.screenY + window.innerHeight / 2 - options.height / 2);

        self.joinWindow = new (window.require('electron').remote.BrowserWindow)(options);
        let sub = window.location.hostname.split('.')[0];
        let url = self.connectEndPoint + (sub === 'canary' || sub === 'ptb' ? `/${sub}` : '');
        self.joinWindow.on('close', e => {
            self.checkConnection();
        });
        self.joinWindow.webContents.on('did-navigate', (event, url) => {
            if (!url.includes("connect/callback")) return;
            self.joinWindow.close();
        });
        self.joinWindow.loadURL(url);
    }

    render() {
        return BDV2.react.createElement(V2Components.SidebarView, { ref: "sbv", children: this.component });
    }

    get component() {
        return {
            'sidebar': {
                'component': this.sidebar
            },
            'content': {
                'component': this.content
            }
        };
    }

    get sidebar() {
        return BDV2.react.createElement(
            "div",
            { className: "sidebar", key: "ps" },
            BDV2.react.createElement(
                "div",
                { className: "ui-tab-bar SIDE" },
                BDV2.react.createElement(
                    "div",
                    { className: "ui-tab-bar-header", style: { fontSize: "16px" } },
                    "Public Servers"
                ),
                BDV2.react.createElement(V2Components.TabBar.Separator, null),
                this.searchInput,
                BDV2.react.createElement(V2Components.TabBar.Separator, null),
                BDV2.react.createElement(V2Components.TabBar.Header, { text: "Categories" }),
                this.categoryButtons.map((value, index) => {
                    return BDV2.react.createElement(V2Components.TabBar.Item, { id: index, onClick: this.changeCategory, key: index, text: value, selected: this.state.selectedCategory === index });
                }),
                BDV2.react.createElement(V2Components.TabBar.Separator, null),
                this.footer,
                this.connection
            )
        );
    }

    get searchInput() {
        return BDV2.react.createElement(
            "div",
            { className: "ui-form-item" },
            BDV2.react.createElement(
                "div",
                { className: "ui-text-input flex-vertical", style: { width: "172px", marginLeft: "10px" } },
                BDV2.react.createElement("input", { ref: "searchinput", onKeyDown: this.searchKeyDown, onChange: () => {}, type: "text", className: "input default", placeholder: "Search...", maxLength: "50" })
            )
        );
    }

    searchKeyDown(e) {
        let self = this;
        if (self.state.loading || e.which !== 13) return;
        self.setState({
            'loading': true,
            'title': 'Loading...',
            'term': e.target.value
        });
        let query = `?term=${e.target.value}`;
        if (self.state.selectedCategory !== 0) {
            query += `&category=${self.categoryButtons[self.state.selectedCategory]}`;
        }
        self.search(query, true);
    }

    get categoryButtons() {
        return ["All", "FPS Games", "MMO Games", "Strategy Games", "Sports Games", "Puzzle Games", "Retro Games", "Party Games", "Tabletop Games", "Sandbox Games", "Simulation Games", "Community", "Language", "Programming", "Other"];
    }

    changeCategory(id) {
        let self = this;
        if (self.state.loading) return;
        self.refs.searchinput.value = "";
        self.setState({
            'loading': true,
            'selectedCategory': id,
            'title': 'Loading...',
            'term': null
        });
        if (id === 0) {
            self.search("", true);
            return;
        }
        self.search(`?category=${self.categoryButtons[id]}`, true);
    }

    get content() {
        let self = this;
        if (self.state.connection.state === 1) return self.notConnected;
        return [BDV2.react.createElement(
            "div",
            { ref: "content", key: "pc", className: "content-column default" },
            BDV2.react.createElement(V2Components.SettingsTitle, { text: self.state.title }),
            self.bdServer,
            self.state.servers.map((server, index) => {
                return BDV2.react.createElement(V2Components.ServerCard, { key: index, server: server, join: self.join });
            }),
            self.state.next && BDV2.react.createElement(
                "button",
                { type: "button", onClick: () => {
                        if (self.state.loading) return;self.setState({ 'loading': true });self.search(self.state.next, false);
                    }, className: "ui-button filled brand small grow", style: { width: "100%", marginTop: "10px", marginBottom: "10px" } },
                BDV2.react.createElement(
                    "div",
                    { className: "ui-button-contents" },
                    self.state.loading ? 'Loading' : 'Load More'
                )
            ),
            self.state.servers.length > 0 && BDV2.react.createElement(V2Components.SettingsTitle, { text: self.state.title })
        ), BDV2.react.createElement(V2Components.Tools, { key: "pt", ref: "tools", onClick: self.close })];
    }

    get notConnected() {
        let self = this;
        return [BDV2.react.createElement(
            "div",
            { key: "ncc", ref: "content", className: "content-column default" },
            BDV2.react.createElement(
                "h2",
                { className: "ui-form-title h2 margin-reset margin-bottom-20" },
                "Not connected to discordservers.com!",
                BDV2.react.createElement(
                    "button",
                    { onClick: self.connect, type: "button", className: "ui-button filled brand small grow", style: { display: "inline-block", minHeight: "18px", marginLeft: "10px", lineHeight: "14px" } },
                    BDV2.react.createElement(
                        "div",
                        { className: "ui-button-contents" },
                        "Connect"
                    )
                )
            ),
            self.bdServer
        ), BDV2.react.createElement(V2Components.Tools, { key: "nct", ref: "tools", onClick: self.close })];
    }

    get footer() {
        return BDV2.react.createElement(
            "div",
            { className: "ui-tab-bar-header" },
            BDV2.react.createElement(
                "a",
                { href: "https://discordservers.com", target: "_blank" },
                "Discordservers.com"
            )
        );
    }

    get connection() {
        let self = this;
        let { connection } = self.state;
        if (connection.state !== 2) return BDV2.react.createElement("span", null);

        return BDV2.react.createElement(
            "span",
            null,
            BDV2.react.createElement(V2Components.TabBar.Separator, null),
            BDV2.react.createElement(
                "span",
                { style: { color: "#b9bbbe", fontSize: "10px", marginLeft: "10px" } },
                "Connected as: ",
                `${connection.user.username}#${connection.user.discriminator}`
            ),
            BDV2.react.createElement(
                "div",
                { style: { padding: "5px 10px 0 10px" } },
                BDV2.react.createElement(
                    "button",
                    { style: { width: "100%", minHeight: "20px" }, type: "button", className: "ui-button filled brand small grow" },
                    BDV2.react.createElement(
                        "div",
                        { className: "ui-button-contents", onClick: self.connect },
                        "Reconnect"
                    )
                )
            )
        );
    }
}

class V2Components {
    static get SettingsPanel() {
        return V2C_SettingsPanel;
    }
    static get Switch() {
        return V2C_Switch;
    }
    static get Scroller() {
        return V2C_Scroller;
    }
    static get TabBar() {
        return V2Cs_TabBar;
    }
    static get SideBar() {
        return V2C_SideBar;
    }
    static get Tools() {
        return V2C_Tools;
    }
    static get SettingsTitle() {
        return V2C_SettingsTitle;
    }
    static get CssEditor() {
        return V2C_CssEditor;
    }
    static get Checkbox() {
        return V2C_Checkbox;
    }
    static get List() {
        return V2C_List;
    }
    static get PluginCard() {
        return V2C_PluginCard;
    }
    static get ThemeCard() {
        return V2C_ThemeCard;
    }
    static get ContentColumn() {
        return V2C_ContentColumn;
    }
    static get XSvg() {
        return V2C_XSvg;
    }
    static get Layer() {
        return V2C_Layer;
    }
    static get SidebarView() {
        return V2C_SidebarView;
    }
    static get ServerCard() {
        return V2C_ServerCard;
    }
}

class V2_PublicServers {

    constructor() {}

    get component() {
        return BDV2.react.createElement(V2Components.Layer, { rootId: "pubslayerroot", id: "pubslayer", children: BDV2.react.createElement(V2C_PublicServers, { rootId: "pubslayerroot" }) });
    }

    get root() {
        let _root = $("#pubslayerroot");
        if (!_root.length) {
            if (!this.injectRoot()) return null;
            return this.root;
        }
        return _root[0];
    }

    injectRoot() {
        if (!$(".layers").length) return false;
        $(".layers").append($("<span/>", {
            id: 'pubslayerroot'
        }));
        return true;
    }

    render() {
        let root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: .layers");
            return;
        }
        BDV2.reactDom.render(this.component, root);
    }
}

class V2_SettingsPanel_Sidebar {

    constructor(onClick) {
        this.onClick = onClick;
    }

    get items() {
        return [{ 'text': 'Core', 'id': 'core' }, { 'text': 'Emotes', 'id': 'emotes' }, { 'text': 'Custom CSS', 'id': 'customcss' }, { 'text': 'Plugins', 'id': 'plugins' }, { 'text': 'Themes', 'id': 'themes' }];
    }

    get component() {
        return BDV2.react.createElement(
            "span",
            null,
            BDV2.react.createElement(V2Components.SideBar, { onClick: this.onClick, headerText: "BetterDiscord", items: this.items }),
            BDV2.react.createElement(
                "span",
                { style: { fontSize: "12px", fontWeight: "600", color: "#72767d", padding: "6px 10px" } },
                `v${bdVersion}:${jsVersion} by `,
                BDV2.react.createElement(
                    "a",
                    { href: "https://github.com/Jiiks/", target: "_blank" },
                    "Jiiks"
                )
            )
        );
    }

    get root() {
        let _root = $("#bd-settings-sidebar");
        if (!_root.length) {
            if (!this.injectRoot()) return null;
            return this.root;
        }
        return _root[0];
    }

    injectRoot() {
        let changeLog = $(".ui-tab-bar-item:not(.danger)").last();
        if (!changeLog.length) return false;
        $("<span/>", { 'id': 'bd-settings-sidebar' }).insertBefore(changeLog.prev());
        return true;
    }

    render() {
        let root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: .ui-tab-bar-item:not(.danger)");
            return;
        }
        BDV2.reactDom.render(this.component, root);
    }
}

class V2_SettingsPanel {

    constructor() {
        let self = this;
        self.sideBarOnClick = self.sideBarOnClick.bind(self);
        self.onChange = self.onChange.bind(self);
        self.updateSettings = this.updateSettings.bind(self);
        self.sidebar = new V2_SettingsPanel_Sidebar(self.sideBarOnClick);
    }

    get root() {
        let _root = $("#bd-settingspane-container");
        if (!_root.length) {
            if (!this.injectRoot()) return null;
            return this.root;
        }
        return _root[0];
    }

    injectRoot() {
        if (!$(".layer .ui-standard-sidebar-view").length) return false;
        $(".layer .ui-standard-sidebar-view").append($("<div/>", {
            class: 'content-region',
            id: 'bd-settingspane-container'
        }));
        return true;
    }

    get coreSettings() {
        return this.getSettings("core");
    }
    get emoteSettings() {
        return this.getSettings("emote");
    }
    getSettings(category) {
        return Object.keys(settings).reduce((arr, key) => {
            let setting = settings[key];
            if (setting.cat === category && setting.implemented && !setting.hidden) {
                setting.text = key;
                arr.push(setting);
            }
            return arr;
        }, []);
    }

    sideBarOnClick(id) {
        let self = this;
        $(".content-region").first().hide();
        $(self.root).show();
        switch (id) {
            case 'core':
                self.renderCoreSettings();
                break;
            case 'emotes':
                self.renderEmoteSettings();
                break;
            case 'customcss':
                self.renderCustomCssEditor();
                break;
            case 'plugins':
                self.renderPluginPane();
                break;
            case 'themes':
                self.renderThemePane();
                break;
        }
    }

    onClick(id) {}

    onChange(id, checked) {
        settingsCookie[id] = checked;
        this.updateSettings();
    }

    updateSettings() {
        let _c = settingsCookie;

        if (_c["bda-es-0"]) {
            $("#twitchcord-button-container").show();
        } else {
            $("#twitchcord-button-container").hide();
        }

        if (_c["bda-gs-b"]) {
            $("body").addClass("bd-blue");
        } else {
            $("body").removeClass("bd-blue");
        }

        if (_c["bda-gs-2"]) {
            $("body").addClass("bd-minimal");
        } else {
            $("body").removeClass("bd-minimal");
        }

        if (_c["bda-gs-3"]) {
            $("body").addClass("bd-minimal-chan");
        } else {
            $("body").removeClass("bd-minimal-chan");
        }

        if (_c["bda-gs-1"]) {
            $("#bd-pub-li").show();
        } else {
            $("#bd-pub-li").hide();
        }

        if (_c["bda-gs-4"]) {
            voiceMode.enable();
        } else {
            voiceMode.disable();
        }

        if (_c["bda-gs-5"]) {
            $("#app-mount").addClass("bda-dark");
        } else {
            $("#app-mount").removeClass("bda-dark");
        }

        if (_c["bda-es-6"]) {
            //Pretty emote titles
            emoteNamePopup = $("<div class='tipsy tipsy-se' style='display: block; top: 82px; left: 1630.5px; visibility: visible; opacity: 0.8;'><div class='tipsy-inner'></div></div>");
            $(document).on("mouseover", ".emote", function () {
                var x = $(this).offset();
                var title = $(this).attr("alt");
                $(emoteNamePopup).find(".tipsy-inner").text(title);
                $(emoteNamePopup).css('left', x.left - 25);
                $(emoteNamePopup).css('top', x.top - 32);
                $("div[data-reactid='.0.1.1']").append($(emoteNamePopup));
            });
            $(document).on("mouseleave", ".emote", function () {
                $(".tipsy").remove();
            });
        } else {
            $(document).off('mouseover', '.emote');
        }

        if (_c["bda-gs-8"]) {
            dMode.enable();
        } else {
            dMode.disable();
        }

        mainCore.saveSettings();
    }

    renderSidebar() {
        let self = this;
        $(".ui-tab-bar-item").off('click.v2settingspanel').on('click.v2settingspanel', e => {
            BDV2.reactDom.unmountComponentAtNode(self.root);
            $(self.root).hide();
            $(".content-region").first().show();
        });
        self.sidebar.render();
    }

    get coreComponent() {
        return BDV2.react.createElement(V2Components.Scroller, { fade: true, dark: true, children: [BDV2.react.createElement(V2Components.SettingsPanel, { key: "cspanel", title: "Core Settings", onChange: this.onChange, settings: this.coreSettings }), BDV2.react.createElement(V2Components.Tools, { key: "tools" })] });
    }

    get emoteComponent() {
        return BDV2.react.createElement(V2Components.Scroller, { fade: true, dark: true, children: [BDV2.react.createElement(V2Components.SettingsPanel, { key: "espanel", title: "Emote Settings", onChange: this.onChange, settings: this.emoteSettings }), BDV2.react.createElement(V2Components.Tools, { key: "tools" })] });
    }

    get customCssComponent() {
        return BDV2.react.createElement(V2Components.Scroller, { fade: true, dark: true, children: [BDV2.react.createElement(V2Components.CssEditor, { key: "csseditor" }), BDV2.react.createElement(V2Components.Tools, { key: "tools" })] });
    }

    get pluginsComponent() {
        let plugins = Object.keys(bdplugins).reduce((arr, key) => {
            arr.push(BDV2.react.createElement(V2Components.PluginCard, { key: key, plugin: bdplugins[key].plugin }));return arr;
        }, []);
        let list = BDV2.react.createElement(V2Components.List, { key: "plugin-list", className: "bda-slist", children: plugins });
        let contentColumn = BDV2.react.createElement(V2Components.ContentColumn, { key: "pcolumn", title: "Plugins", children: list });
        return BDV2.react.createElement(V2Components.Scroller, { fade: true, dark: true, children: [contentColumn, BDV2.react.createElement(V2Components.Tools, { key: "tools" })] });
    }

    get themesComponent() {
        let themes = Object.keys(bdthemes).reduce((arr, key) => {
            arr.push(BDV2.react.createElement(V2Components.ThemeCard, { key: key, theme: bdthemes[key] }));return arr;
        }, []);
        let list = BDV2.react.createElement(V2Components.List, { key: "theme-list", className: "bda-slist", children: themes });
        let contentColumn = BDV2.react.createElement(V2Components.ContentColumn, { key: "tcolumn", title: "Themes", children: list });
        return BDV2.react.createElement(V2Components.Scroller, { fade: true, dark: true, children: [contentColumn, BDV2.react.createElement(V2Components.Tools, { key: "tools" })] });
    }

    renderCoreSettings() {
        let root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: .layer .ui-standard-sidebar-view");
            return;
        }
        BDV2.reactDom.render(this.coreComponent, root);
    }

    renderEmoteSettings() {
        let root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: .layer .ui-standard-sidebar-view");
            return;
        }
        BDV2.reactDom.render(this.emoteComponent, root);
    }

    renderCustomCssEditor() {
        let root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: .layer .ui-standard-sidebar-view");
            return;
        }
        BDV2.reactDom.render(this.customCssComponent, root);
    }

    renderPluginPane() {
        let root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: .layer .ui-standard-sidebar-view");
            return;
        }
        BDV2.reactDom.render(this.pluginsComponent, root);
    }

    renderThemePane() {
        let root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: .layer .ui-standard-sidebar-view");
            return;
        }
        BDV2.reactDom.render(this.themesComponent, root);
    }
}
