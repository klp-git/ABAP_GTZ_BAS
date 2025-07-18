
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/core/Control",
    "sap/ui/core/BusyIndicator",
    "sap/m/Button",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/PDFViewer",
    "sap/m/MessageToast"
], function (Controller, JSONModel, ODataModel, Control, BusyIndicator, Button, Filter, FilterOperator, PDFViewer, MessageToast) {
    "use strict";

    return Controller.extend("zmemodetail.controller.View1",{

        onInit: function () {
            this.oDataModel = new ODataModel("/sap/opu/odata/sap/ZSS_ZPP_PRD_MEMO/", {
                defaultCountMode: "None"
            });
            this.oDataModel.setDefaultBindingMode("OneWay");
            this.getView().setModel(this.oDataModel);
        },

        onClickPrint: function () {
            var that = this;

            BusyIndicator.show();
            if (!this.selectedDoc) {
                MessageToast.show("Select a Document");
                BusyIndicator.hide();
            } else {
                var formData = new FormData();
                console.log(this.selectedDoc);
                formData.append("Reservation", this.selectedDoc.Reservation);
                formData.append("DivisionName", this.selectedDoc.DivisionName);

                $.ajax({
                    url: "/sap/bc/http/sap/ZPP_PRD_MEMO",
                    method: "POST",
                    data: formData,
                    processData: false,
                    contentType: false,
                    success: function (result) {
                        if (result.includes("Reservation")) {
                            MessageToast.show(result);
                            BusyIndicator.hide();
                            return;
                        }
                        if (result.includes("DivisionName")) {
                            MessageToast.show(result);
                            BusyIndicator.hide();
                            return;
                        }
                        var decodedPdfContent = atob(result);
                        var byteArray = new Uint8Array(decodedPdfContent.length);
                        for (var i = 0; i < decodedPdfContent.length; i++) {
                            byteArray[i] = decodedPdfContent.charCodeAt(i);
                        }
                        var blob = new Blob([byteArray.buffer], {
                            type: 'application/pdf'
                        });
                        var _pdfurl = URL.createObjectURL(blob);

                        if (!that._PDFViewer) {
                            that._PDFViewer = new PDFViewer({
                                width: "auto",
                                source: _pdfurl
                            });
                        } else {
                            that._PDFViewer = new PDFViewer({
                                width: "auto",
                                source: _pdfurl
                            });
                        }
                        BusyIndicator.hide();
                        that._PDFViewer.open();
                    }
                });
            }
        },

        onSelectionChange: function (oEvent) {
            //this.selectedDoc = oEvent.mParameters.listItem.getBindingContext().sPath.split("'")[1];
            //this.byId("_IDGenButton4").setEnabled(true);

            var oSelectedItem = oEvent.mParameters.listItem;
            var oContext = oSelectedItem.getBindingContext();

            // Store the full row data in this.selectedDoc
            this.selectedDoc = oContext.getObject();

            // Enable the print button
            this.byId("_IDGenButton4").setEnabled(true);

            // Optionally, log the selected data to the console for debugging
            console.log(this.selectedDoc);
        }

    });
});
