/**
 *
 * (c) Copyright Ascensio System Limited 2010-2017
 *
 * This program is freeware. You can redistribute it and/or modify it under the terms of the GNU
 * General Public License (GPL) version 3 as published by the Free Software Foundation (https://www.gnu.org/copyleft/gpl.html).
 * In accordance with Section 7(a) of the GNU GPL its Section 15 shall be amended to the effect that
 * Ascensio System SIA expressly excludes the warranty of non-infringement of any third-party rights.
 *
 * THIS PROGRAM IS DISTRIBUTED WITHOUT ANY WARRANTY; WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR
 * FITNESS FOR A PARTICULAR PURPOSE. For more details, see GNU GPL at https://www.gnu.org/copyleft/gpl.html
 *
 * You can contact Ascensio System SIA by email at sales@onlyoffice.com
 *
 * The interactive user interfaces in modified source and object code versions of ONLYOFFICE must display
 * Appropriate Legal Notices, as required under Section 5 of the GNU GPL version 3.
 *
 * Pursuant to Section 7 § 3(b) of the GNU GPL you must retain the original ONLYOFFICE logo which contains
 * relevant author attributions when distributing the software. If the display of the logo in its graphic
 * form is not reasonably feasible for technical reasons, you must include the words "Powered by ONLYOFFICE"
 * in every copy of the program you distribute.
 * Pursuant to Section 7 § 3(e) we decline to grant you any rights under trademark law for use of our trademarks.
 *
 */

(function ($, OCA) {

    OCA.Onlyoffice = _.extend({}, OCA.Onlyoffice);
    if (!OCA.Onlyoffice.AppName) {
        OCA.Onlyoffice = {
            AppName: "onlyoffice"
        };
    }

    function onSuccess(config) {
        if (config) {
            if (config.error != null) {
                
				OC.Notification.showTemporary(config.error);
                return;
            }

            var docIsChanged = null;
            var docIsChangedTimeout = null;

            var setPageTitle = function(event) {
                clearTimeout(docIsChangedTimeout);

                if (docIsChanged !== event.data) {
                    var titleChange = function () {
                        window.document.title = config.document.title + (event.data ? " *" : "") + ' - ' + oc_defaults.title;
                        docIsChanged = event.data;
                    };

                    if (event.data) {
                        titleChange();
                    } else {
                        docIsChangedTimeout = setTimeout(titleChange, 500);
                    }
                }
            };
            setPageTitle(false);

            config.events = {
                "onDocumentStateChange": setPageTitle,
            };

            if (typeof DocsAPI === "undefined") {
                
				OC.Notification.showTemporary(t(OCA.Onlyoffice.AppName, "ONLYOFFICE cannot be reached. Please contact admin"));
                return;
            }

            var docEditor = new DocsAPI.DocEditor("iframeEditor", config);
            OCA.Onlyoffice.docEditor = docEditor;
        }
    }

    var getPublicLinkAccessToken = function() {
        var data = $("data[key='cernboxauthtoken']");
        return data.attr('x-access-token');
    };

    var getUrlParameter = function(sParam) {
        var urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(sParam)
    };

    OCA.Onlyoffice.InitEditor = function () {


        var iframe = $("#iframeEditor");
        var filename = iframe.data("id") || "";

        if (!filename) {
            // This should never happen... But...
            console.warn("FileId is empty");
            return;
        }

        var url;
        var request;

        if (typeof pl_token !== 'undefined' || isPublicPage()) {

            var token;
            var accessToken;
            if (typeof pl_token !== 'undefined') {
                token = pl_token;
                accessToken = getUrlParameter('X-Access-Token');
            } else {
                token = getSharingToken();
                accessToken = getPublicLinkAccessToken();
                filename = ""; // Public link in single file review mode doesn't have filename, only ID
            }

            url = OC.generateUrl('apps/onlyoffice/ajax/configpublic');
            request = {
                method: 'POST',
                headers: {
                    'X-Access-Token': accessToken,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    'filename': filename,
                    'token': token,
                    'folderurl': parent.location.protocol + '//' + location.host + OC.generateUrl('/s/') + token + '?closed=1&path=' + OC.dirname(filename)
                })
            };

        } else {
            url = OC.generateUrl('apps/onlyoffice/ajax/config' + filename);
            request = {
                method: 'GET',
                headers: {
                    'X-Access-Token': OC["X-Access-Token"]
                }
            };
        }
        
        // Use fetch instead of XMLHttpRequest to avoid having leftoverrs from OC...
        fetch(url, request).then(response => response.json())
        .then(onSuccess, function() {
            $('#loader').html('Failed to load the file. Does it exist?');
        });
    };

    var isPublicPage = function () {

		if ($("input#isPublic") && $("input#isPublic").val() === "1") {
			return true;
		} else {
			return false;
		}
	};

	var getSharingToken = function () {
		if ($("input#sharingToken") && $("input#sharingToken").val()) {
			return $("input#sharingToken").val();
		} else {
			return null;
		}
	};

})(jQuery, OCA);


