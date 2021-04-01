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

(function (OCA) {

    OCA.Onlyoffice = _.extend({}, OCA.Onlyoffice);
    if (!OCA.Onlyoffice.AppName) {
        OCA.Onlyoffice = {
            AppName: "onlyoffice"
        };
    }

    OCA.Onlyoffice.setting = {};


    OCA.Onlyoffice.CreateFile = function (name, fileList) {
        var dir = fileList.getCurrentDirectory();

        if (!OCA.Onlyoffice.setting.sameTab) {
            var winEditor = window.open("");
            if (winEditor) {
                winEditor.document.write(t(OCA.Onlyoffice.AppName, "Loading, please wait."));
                winEditor.document.close();
            }
        }

        $.post(OC.generateUrl("apps/" + OCA.Onlyoffice.AppName + "/ajax/new"),
            {
                name: name,
                dir: dir
            },
            function onSuccess(response) {
                if (response.error) {
                    if (winEditor) {
                        winEditor.close();
                    }
                    var row = OC.Notification.show(response.error);
                    setTimeout(function () {
                        OC.Notification.hide(row);
                    }, 3000);
                    return;
                }

                fileList.add(response, { animate: true });
		        var fn = dir +"/" + response.name;
                OCA.Onlyoffice.OpenEditor(fn, 31, winEditor); // the file was just created so use the max permissions 31

                var row = OC.Notification.show(t(OCA.Onlyoffice.AppName, "File created"));
                setTimeout(function () {
                    OC.Notification.hide(row);
                }, 3000);
            }
        );
    };

    var isPublicPage = function() {

        if ($("input#isPublic") && $("input#isPublic").val() === "1") {
            return true;
        } else {
            return false;
        }
    };

    var getSharingToken = function() {
        if ($("input#sharingToken") && $("input#sharingToken").val()) {
            return $("input#sharingToken").val();
        } else {
            return null;
        }
    };

    var getPublicLinkAccessToken = function() {
        var data = $("data[key='cernboxauthtoken']");
        return data.attr('x-access-token');
    };

    OCA.Onlyoffice.OpenEditor = function (fileId, permissions, winEditor) {
        var path = 'view';
        if (permissions > 1) { // > 1 write permissions
            path = 'edit';
        }

        if (isPublicPage()) {
            var token = getSharingToken();
            url = OC.generateUrl('/apps/onlyoffice/public/' + token + '/' + path + fileId + '?X-Access-Token=' + getPublicLinkAccessToken());
        } else {
            url = OC.generateUrl('/apps/onlyoffice/' + path + fileId);
        }

        window.open(url, '_blank');

	// CERNBox, we load editor without refreshing the page
        //if (winEditor && winEditor.location) {
        //    winEditor.location.href = url;
        //} else if (!OCA.Onlyoffice.setting.sameTab) {
        //    winEditor = window.open(url, "_blank");
        //} else {
        //    location.href = url;
        //}
    };

    OCA.Onlyoffice.loadEditor = function(fileId) {
        var template = '<div id="app"><div id="iframeEditor" data-id="{{id}}"></div></div>';
	    var _template = Handlebars.compile(template);
	    _template = _template({"id": fileId, "documentServerUrl": OCA.Onlyoffice.documentServer});
        $('#content').html(_template);
        OCA.Onlyoffice.InitEditor();
    }

    OCA.Onlyoffice.FileClick = function (fileName, context, attr) {
        var fileInfoModel = context.fileInfoModel || context.fileList.getModelForFile(fileName);
        var fileList = context.fileList;
        if (!attr.conv) {
            OCA.Onlyoffice.OpenEditor(fileInfoModel.get("path") + "/" + fileInfoModel.get("name"), fileInfoModel.get("permissions"));
            return;
        }

        // We don't support conversion
        // OC.dialogs.confirm(t(OCA.Onlyoffice.AppName, "The document file you open will be converted to the Office Open XML format for faster viewing and editing."),
        //     t(OCA.Onlyoffice.AppName, "Convert and open document"),
        //     function (convert) {
        //         if (!convert) {
        //             return;
        //         }

        //         $.post(OC.generateUrl("apps/" + OCA.Onlyoffice.AppName + "/ajax/convert"),
        //             {
        //                 fileId: fileInfoModel.id
        //             },
        //             function onSuccess(response) {
        //                 if (response.error) {
        //                     var row = OC.Notification.show(response.error);
        //                     setTimeout(function () {
        //                         OC.Notification.hide(row);
        //                     }, 3000);
        //                     return;
        //                 }

        //                 if (response.parentId == fileList.dirInfo.id) {
        //                     fileList.add(response, { animate: true });
        //                 }

        //                 var row = OC.Notification.show(t(OCA.Onlyoffice.AppName, "File created"));
        //                 setTimeout(function () {
        //                     OC.Notification.hide(row);
        //                 }, 3000);
        //             })
        //             .fail(function(status) {
        //                 if (status === 412) {
        //                     OC.Notification.show(t('files', 'Could not create file "{file}" because it already exists',
        //                         {file: name}), {type: 'error'}
        //                     );
        //                 } else {
        //                     OC.Notification.show(t('files', 'Could not create file "{file}"',
        //                         {file: name}), {type: 'error'}
        //                     );
        //                 }
        //                 deferred.reject(status);
        //             });
        //     });
    };

    OCA.Onlyoffice.RegisterFileList = function(mimePl, mimeFoundFn) {

        $.get(OC.generateUrl("apps/" + OCA.Onlyoffice.AppName + "/ajax/settings"),
            function onSuccess(settings) {
                OCA.Onlyoffice.setting = settings;
                var mimes = OCA.Onlyoffice.setting.formats;

                OCA.Onlyoffice.mimes = mimes;
                $.each(mimes, function (ext, attr) {

                    if (mimePl !== undefined && mimePl === attr.mime && attr.edit && attr.def) {
                        mimeFoundFn();
                    }

                    if (attr.edit) {
                        OCA.Files.fileActions.registerAction({
                            name: "onlyofficeOpen",
                            displayName: t(OCA.Onlyoffice.AppName, "Open in ONLYOFFICE"),
                            mime: attr.mime,
                            permissions: OC.PERMISSION_READ,
                            icon: function () {
                                return OC.imagePath(OCA.Onlyoffice.AppName, "btn-edit");
                            },
                            actionHandler: function (fileName, context) {
                // TODO(labkode): plug here window.confirm("Open with OnlyOffice?");
                                OCA.Onlyoffice.FileClick(fileName, context, attr);
                            }
                        });

                        if (attr.def && !OCA.Files.fileActions.getDefaultFileAction(attr.mime, "file", OC.PERMISSION_READ)) {
                            OCA.Files.fileActions.setDefault(attr.mime, "onlyofficeOpen");
                        }
                    }
                });
            }
        );
    };

    // OCA.Onlyoffice.NewFileMenu = {
    //     attach: function (menu) {
    //         var fileList = menu.fileList;

    //         if (fileList.id !== "files") {
    //             return;
    //         }

    //         menu.addMenuEntry({
    //             id: "onlyofficeDocx",
    //             displayName: t(OCA.Onlyoffice.AppName, "Document"),
    //             templateName: t(OCA.Onlyoffice.AppName, "Document.docx"),
    //             iconClass: "icon-onlyoffice-new-docx",
    //             fileType: "docx",
    //             actionHandler: function (name) {
    //                 OCA.Onlyoffice.CreateFile(name, fileList);
    //             }
    //         });

    //         menu.addMenuEntry({
    //             id: "onlyofficeXlsx",
    //             displayName: t(OCA.Onlyoffice.AppName, "Spreadsheet"),
    //             templateName: t(OCA.Onlyoffice.AppName, "Spreadsheet.xlsx"),
    //             iconClass: "icon-onlyoffice-new-xlsx",
    //             fileType: "xlsx",
    //             actionHandler: function (name) {
    //                 OCA.Onlyoffice.CreateFile(name, fileList);
    //             }
    //         });

    //         menu.addMenuEntry({
    //             id: "onlyofficePpts",
    //             displayName: t(OCA.Onlyoffice.AppName, "Presentation"),
    //             templateName: t(OCA.Onlyoffice.AppName, "Presentation.pptx"),
    //             iconClass: "icon-onlyoffice-new-pptx",
    //             fileType: "pptx",
    //             actionHandler: function (name) {
    //                 OCA.Onlyoffice.CreateFile(name, fileList);
    //             }
    //         });
    //     }
    // };
    
    // return promise
    OCA.Onlyoffice.loadConfig = function() {
    	var url = OC.generateUrl('/apps/onlyoffice/config');
	    return $.get(url);
    }

    OCA.Onlyoffice.loadOnlyOfficeAPI = function() {
		// CERNBOX
		// add script at the page load
		var script = document.createElement('script');
		script.src = OCA.Onlyoffice.documentServer+"web-apps/apps/api/documents/api.js";
		document.head.appendChild(script);
    }

})(OCA);


$(document).ready(function() {

    var getUrlParameter = function (sParam) {
        var urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(sParam)
    };


    if (typeof open_file !== 'undefined') {

        if (this_app === "onlyoffice") {
            // This is the new tab
            OCA.Onlyoffice.loadConfig().success(function (response) {
                OCA.Onlyoffice.documentServer = response.document_server;
                OCA.Onlyoffice.loadOnlyOfficeAPI();
                OCA.Onlyoffice.loadEditor(open_file);
            }); 
        }

    } else if ($('#isPublic').val()) {

        // !! Only use OnlyOffice in public links !! 
            
        OCA.Onlyoffice.loadConfig().success(function (response) {
            OCA.Onlyoffice.documentServer = response.document_server;
            OCA.Onlyoffice.loadOnlyOfficeAPI();

            if (getUrlParameter('closed') !== '1') {
                var sharingToken = $('#sharingToken').val();
                mime = $('#mimetype').val();

                OCA.Onlyoffice.RegisterFileList(mime, function() {
                    OCA.Onlyoffice.loadEditor(sharingToken);
                });
            } else {
                OCA.Onlyoffice.RegisterFileList();
            }
        }); 

    } else if (!$('#body-login').length) { // don't show office in the login page (including public links with password)
    
        OCA.Onlyoffice.RegisterFileList()
        OC.Plugins.register("OCA.Files.NewFileMenu", OCA.Onlyoffice.NewFileMenu); // Create files by default using OO
        OCA.Onlyoffice.loadConfig().success(function (response) {
            OCA.Onlyoffice.documentServer = response.document_server;
            OCA.Onlyoffice.loadOnlyOfficeAPI();
        }); 

        // Show pop up with info
        var current_office = "onlyoffice";
        $.getJSON(OC.generateUrl('/apps/office'), function(response) {
            if (response.engine != current_office) {

                var img_url = OC.imagePath(OCA.Onlyoffice.AppName, 'onlyoffice_logo.png');

                $("body").append('<div id="dialog_office">\
                    <h2>OnlyOffice is the new default office editor!</h2>\
                    <div style="background: #2b5880;border-radius: 5px 5px 0 0;height: 60px;margin-top: 21px;display: flex;">\
                        <img src="' + img_url + '" style="max-height:50px;margin: auto;text-align: center;">\
                    </div>\
                    <div style="border-radius: 0 0 5px 5px;padding:15px;border:1px solid #ccc;border-top: 0;text-align:left;">\
                        <ul>\
                            <li>• Compatibility with Microsoft Office documents</li>\
                            <li>• Concurrent editing by multiple people</li>\
                            <li>• Complete set of formatting tools</li>\
                        </ul>\
                    </div>\
                    <p style="margin-top: 9px; font-size: 0.85em; text-align: left; margin-left: 10px;">\
                        <a href="https://cern.service-now.com/service-portal?id=kb_article&n=KB0006643" style="color: #757575;" target="_blank">Access to MS Office Online is still possible (KB0006643)</a>\
                    </p>\
                </div>');

                $( "#dialog_office" ).dialog({
                    resizable: false,
                    height: "auto",
                    width: 500,
                    modal: true
                    })
                    .on('dialogclose', function(event) {
                        $.post(OC.generateUrl('/apps/office'), {engine: current_office});
                    })
                    .css("padding", "20px");


                $(".ui-widget-overlay.ui-front").css("background", "rgba(0,0,0, 0.65)").css("z-index", "10000");
                var box_shadow = "0px 0px 45px 0 rgba(0,0,0,0.2)";
                $(".ui-dialog")
                    .css("z-index", "10001")
                    .css("background", "white")
                    .css("border", "0")
                    .css("text-align", "center")
                    .css("box-shadow", box_shadow)
                    .css("-webkit-box-shadow", box_shadow)
                    .css("-moz-box-shadow", box_shadow);;
                $(".ui-dialog-titlebar")
                    .css("background", "none")
                    .css("border", "0")
                    .css("position", "absolute")
                    .css("right", "3px")
                    .css("z-index", "1");
                }
            });
        }
    });
