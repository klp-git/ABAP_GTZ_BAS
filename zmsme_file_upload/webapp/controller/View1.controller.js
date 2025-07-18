sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
], function (Controller, JSONModel, MessageToast) {
    "use strict";
    let listData = [];
    return Controller.extend("zmsmefileupload.controller.View1", {
        onInit: function () {
            this.oExcelDataModel = new JSONModel();
            this.getView().setModel(this.oExcelDataModel, 'TableDataModel')
        },

        // Handle Excel Upload
        onUpload: function (oEvent) {
            var that = this;
            var file = oEvent.getParameter("files") && oEvent.getParameter("files")[0];
            if (!file) {
                console.error("No file selected.");
                return;
            }
            //console.log(file);
            if (window.FileReader) {
                var reader = new FileReader();
                reader.onloadstart = function () {
                    console.log("File reading started...");
                };
                reader.onload = function (e) {
                    var data = e.target.result;
                    try {
                        var workbook = XLSX.read(data, {
                            type: 'binary'
                        });
                        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
                            console.error("No sheets found in the Excel file.");
                            return;
                        }
                        var excelData = [];
                        var headers = [];
                        workbook.SheetNames.forEach(function (sheetName) {
                            var worksheet = workbook.Sheets[sheetName];
                            excelData = XLSX.utils.sheet_to_row_object_array(worksheet);
                            headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0];
                            excelData.forEach((element) => {
                                let data = {
                                    "vendorno": element["vendorno"],
                                    "vendortype": element["vendortype"],
                                    "certificateno": element["certificateno"],
                                    "validfrom": element["validfrom"],
                                    "validto": element["validto"],
                                    "registrationcity": element["registrationcity"],
                                    "creationdate": element["creationdate"],
                                    "status": element["status"]
                                };
                                listData.push(data);
                            });
                            console.log("Extracted Data: ", excelData);
                            console.log("Extracted Headers: ", headers);
                            // Use 'that' here to access the controller's scope
                            //that.setDataModel();
                        });

                    } catch (error) {
                        console.error("Error parsing the Excel file: ", error);
                    }
                };
                reader.onerror = function (error) {
                    console.error("Error reading file: ", error);
                };
                reader.readAsBinaryString(file);
            } else {
                console.error("FileReader is not supported in this browser.");
            }
        },



        handleUpload: function () {
            // let data = this.byId("MainList").getModel("TableData").getProperty("/TradeData");

            let data = listData;
            console.log(data);

            if (!data.length) {
                alert("No data filled")
                return
            }

            let ndata = data.map((newdata) => {
                return {
                    "vendorno": newdata["vendorno"],
                    "vendortype": newdata["vendortype"],
                    "certificateno": newdata["certificateno"],
                    "validfrom": newdata["validfrom"],
                    "validto": newdata["validto"],
                    "registrationcity": newdata["registrationcity"],
                    "creationdate": newdata["creationdate"],
                    "status": newdata["status"]
                }
            })

            $.ajax({
                url: '/sap/bc/http/sap/ZHTTP_MSME',
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify(ndata),
                success: function (response) {
                    console.log('Upload successful:', response);
                    sap.m.MessageToast.show("Upload successful!");
                },

                error: function (error) {
                    console.error('Error during upload:', error);
                    sap.m.MessageToast.show("Upload failed: " + (error.responseText || "Unknown error"));
                }
            });

        }

    });
});