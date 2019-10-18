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


	OCA.Onlyoffice.wordMime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
	OCA.Onlyoffice.excelMime = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
	OCA.Onlyoffice.powertpointMime = "application/vnd.openxmlformats-officedocument.presentationml.presentation";


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
                OCA.Onlyoffice.OpenEditor(fn, winEditor);

                var row = OC.Notification.show(t(OCA.Onlyoffice.AppName, "File created"));
                setTimeout(function () {
                    OC.Notification.hide(row);
                }, 3000);
            }
        );
    };

    OCA.Onlyoffice.OpenEditor = function (fileId, winEditor) {
        var template = '<div id="app"><div id="iframeEditor" data-id="{{id}}"></div></div>';
	var _template = Handlebars.compile(template);
	_template = _template({"id": fileId, "documentServerUrl": OCA.Onlyoffice.documentServer});
       $('#content').html(_template);
       OCA.Onlyoffice.InitEditor();

	// CERNBox, we load editor without refreshing the page
        //if (winEditor && winEditor.location) {
        //    winEditor.location.href = url;
        //} else if (!OCA.Onlyoffice.setting.sameTab) {
        //    winEditor = window.open(url, "_blank");
        //} else {
        //    location.href = url;
        //}
    };

    OCA.Onlyoffice.FileClick = function (fileName, context, attr) {
        var fileInfoModel = context.fileInfoModel || context.fileList.getModelForFile(fileName);
        var fileList = context.fileList;
        if (!attr.conv) {
		console.log(fileInfoModel);
            OCA.Onlyoffice.OpenEditor(fileInfoModel.get("path") + "/" + fileInfoModel.get("name"));
            return;
        }

        OC.dialogs.confirm(t(OCA.Onlyoffice.AppName, "The document file you open will be converted to the Office Open XML format for faster viewing and editing."),
            t(OCA.Onlyoffice.AppName, "Convert and open document"),
            function (convert) {
                if (!convert) {
                    return;
                }

                $.post(OC.generateUrl("apps/" + OCA.Onlyoffice.AppName + "/ajax/convert"),
                    {
                        fileId: fileInfoModel.id
                    },
                    function onSuccess(response) {
                        if (response.error) {
                            var row = OC.Notification.show(response.error);
                            setTimeout(function () {
                                OC.Notification.hide(row);
                            }, 3000);
                            return;
                        }

                        if (response.parentId == fileList.dirInfo.id) {
                            fileList.add(response, { animate: true });
                        }

                        var row = OC.Notification.show(t(OCA.Onlyoffice.AppName, "File created"));
                        setTimeout(function () {
                            OC.Notification.hide(row);
                        }, 3000);
                    });
            });
    };

    OCA.Onlyoffice.FileList = {
        attach: function (fileList) {
            if (fileList.id == "trashbin") {
                return;
            }

            $.get(OC.generateUrl("apps/" + OCA.Onlyoffice.AppName + "/ajax/settings"),
                function onSuccess(settings) {
                    OCA.Onlyoffice.setting = settings;
                    var mimes = OCA.Onlyoffice.setting.formats;

                    OCA.Onlyoffice.mimes = mimes;
                    $.each(mimes, function (ext, attr) {
                        fileList.fileActions.registerAction({
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

                        if (attr.def && !fileList.fileActions.getDefaultFileAction(attr.mime, "file", OC.PERMISSION_READ)) {
                            fileList.fileActions.setDefault(attr.mime, "onlyofficeOpen");
                        }
                    });
                }
            );
        }
    };

    OCA.Onlyoffice.NewFileMenu = {
        attach: function (menu) {
            var fileList = menu.fileList;

            if (fileList.id !== "files") {
                return;
            }

            menu.addMenuEntry({
                id: "onlyofficeDocx",
                displayName: t(OCA.Onlyoffice.AppName, "Document"),
                templateName: t(OCA.Onlyoffice.AppName, "Document"),
                iconClass: "icon-onlyoffice-new-docx",
                fileType: "docx",
                actionHandler: function (name) {
                    OCA.Onlyoffice.CreateFile(name + ".docx", fileList);
                }
            });

            menu.addMenuEntry({
                id: "onlyofficeXlsx",
                displayName: t(OCA.Onlyoffice.AppName, "Spreadsheet"),
                templateName: t(OCA.Onlyoffice.AppName, "Spreadsheet"),
                iconClass: "icon-onlyoffice-new-xlsx",
                fileType: "xlsx",
                actionHandler: function (name) {
                    OCA.Onlyoffice.CreateFile(name + ".xlsx", fileList);
                }
            });

            menu.addMenuEntry({
                id: "onlyofficePpts",
                displayName: t(OCA.Onlyoffice.AppName, "Presentation"),
                templateName: t(OCA.Onlyoffice.AppName, "Presentation"),
                iconClass: "icon-onlyoffice-new-pptx",
                fileType: "pptx",
                actionHandler: function (name) {
                    OCA.Onlyoffice.CreateFile(name + ".pptx", fileList);
                }
            });
        }
    };
    
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

    OCA.Onlyoffice.OpenSingleFileEditor = function (token) {
        var template = '<div id="app"><div id="iframeEditor"></div></div>';
        var _template = Handlebars.compile(template);
        _template = _template({"documentServerUrl": OCA.Onlyoffice.documentServer});
        $('#content').html(_template);
        OCA.Onlyoffice.InitEditor();
    };


})(OCA);


$(document).ready(function() {
    // magic to select engine
    var stored = localStorage.getItem('office-engine');
    if (!stored) {
       console.log('No Office engine preference found, defaulting to onlyoffice');
       localStorage.setItem("office-engine", "onlyoffice");
    }

    var engine = localStorage.getItem("office-engine");
    if (engine == "onlyoffice") {
	    OC.Plugins.register("OCA.Files.FileList", OCA.Onlyoffice.FileList);
	    OC.Plugins.register("OCA.Files.NewFileMenu", OCA.Onlyoffice.NewFileMenu);
    }

    var template =  `
			</br>
			<div class="file-settings-office">
			<p>Choose your Office platform</p>

			<div>
			  <input type="radio" id="microsoft" name="office" value="microsoft">
			  <label for="microsoft">Office 365</label>
			</div>

			<div>
			  <input type="radio" id="onlyoffice" name="office" value="onlyoffice">
			  <label for="onlyoffice">OnlyOffice</label>
			</div>
			</div>
	`;

    OCA.Onlyoffice.loadConfig().success(function (response) {
        OCA.Onlyoffice.documentServer = response.document_server;
        if (engine == "onlyoffice") {
            OCA.Onlyoffice.loadOnlyOfficeAPI();

            if ($('#isPublic').val() && getUrlParameter('closed') !== '1') {
                var sharingToken = $('#sharingToken').val();
                mime = $('#mimetype').val();

                if (mime == OCA.Onlyoffice.wordMime || mime == OCA.Onlyoffice.excelMime || mime == OCA.Onlyoffice.powertpointMime) {
                    OCA.Onlyoffice.OpenSingleFileEditor(sharingToken);
                }
            }
            
        }
    }); 

    $("#app-settings-content").append(template);


    $("#app-settings-content input[name='office']").filter('[value="' + stored + '"]').prop('checked', true);
    $("#app-settings-content input[name='office']").change(function() {
	if (this.value == "onlyoffice") {
		localStorage.setItem("office-engine", "onlyoffice");
		OC.Notification.showTemporary("Your collaborative office platform is set to OnlyOffice");
		location.href = "/";
	} else {
		localStorage.setItem("office-engine", "microsoft");
		OC.Notification.showTemporary("Your collaborative office platform is set to Office 365");
		location.href = "/";
	}
    });

	var getUrlParameter = function (sParam) {
        var urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(sParam)
	};


});
