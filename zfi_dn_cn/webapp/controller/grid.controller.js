sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageToast",
    "sap/m/PDFViewer"
], function (Controller, ODataModel, BusyIndicator, MessageToast, PDFViewer) {
    "use strict";

    return Controller.extend("zfidncn.controller.grid", {

        onInit: function () {
            // Initialize the OData model
            this.oDataModel = new ODataModel("/sap/opu/odata/sap/ZDEF_CD_DN", {
                defaultCountMode: "None"
            });

            this.oDataModel.setDefaultBindingMode("OneWay");

            // Bind the model to the view
            this.getView().setModel(this.oDataModel);

            // Attach event listener for the data load and remove duplicates
            this.oDataModel.attachRequestCompleted(this.onDataLoad.bind(this));
        },

        // Handle data load and remove duplicates based on unique fields
        onDataLoad: function () {
            var oData = this.oDataModel.getData();  // Fetch the OData response

            if (oData && oData.results) {
                // Create a Set to keep track of unique keys
                var uniqueData = [];
                var seen = new Set();

                // Loop through the results and create a unique key for duplicates removal
                oData.results.forEach(function (item) {
                    var key = item.AccountingDocument + item.FiscalYear + item.CompanyCode;

                    if (!seen.has(key)) {
                        uniqueData.push(item);
                        seen.add(key); // Add the key to the Set for future reference
                    }
                });

                // Set the unique data back into the model
                this.oDataModel.setData({ results: uniqueData });
            }
        },

        // Method to handle print button click
        onClickPrint: function () {
            var that = this;

            BusyIndicator.show();

            if (!this.selectedDoc) {
                MessageToast.show("Select a Document");
                BusyIndicator.hide();
            } else {
                var formData = new FormData();
                formData.append("accounting_no", this.selectedDoc.AccountingDocument);
                formData.append("fiscal_year", this.selectedDoc.FiscalYear);
                formData.append("Company_code", this.selectedDoc.CompanyCode);
              
                $.ajax({
                    url: "/sap/bc/http/sap/ZHTTP_FI_CN_DN_SRV",
                    method: "POST",
                    data: formData,
                    processData: false,
                    contentType: false,
                    success: function (result) {
                        if (result.includes("AccountingDocument")) {
                            MessageToast.show(result);
                            BusyIndicator.hide();
                            return;
                        }
                        if (result.includes("FiscalYear")) {
                            MessageToast.show(result);
                            BusyIndicator.hide();
                            return;
                        }
                        if (result.includes("CompanyCode")) {
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

        // Method to handle selection change in the UI
        onSelectionChange: function (oEvent) {
            var oSelectedItem = oEvent.mParameters.listItem;
            var oContext = oSelectedItem.getBindingContext();
            var oSelectedData = oContext.getObject();

            // Prevent duplicate selection by checking if the selected item is the same as the previously stored document
            if (this.selectedDoc && this.selectedDoc.AccountingDocument === oSelectedData.AccountingDocument &&
                this.selectedDoc.FiscalYear === oSelectedData.FiscalYear &&
                this.selectedDoc.CompanyCode === oSelectedData.CompanyCode) {
                return; // If the document is the same, no need to update
            }

            // Store the selected document in this.selectedDoc
            this.selectedDoc = oSelectedData;

            // Enable the print button
            this.byId("_IDGenButton4").setEnabled(true);
            this.byId("_IDGenButton5").setEnabled(true);

            // Log selected data for debugging
            console.log(this.selectedDoc);
        }

    });
});
