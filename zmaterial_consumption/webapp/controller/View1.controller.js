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
 
    return Controller.extend("zmaterialconsumption.controller.View1", {

        onInit: function () {
            this.oDataModel = new ODataModel("/sap/opu/odata/sap/ZSRB_MATERIAL_PROCESS", {
                defaultCountMode: "None"
            });
            this.oDataModel.setDefaultBindingMode("OneWay");
            this.getView().setModel(this.oDataModel);
        },
 
        onClickPrint: function () {
            var that = this;
            BusyIndicator.show();
            
            var oView = this.getView();
            var processOrderNo = oView.byId("_IDGenInput").getValue();
            var materialDocumentNo = oView.byId("_IDGenInput1").getValue();

            if (!processOrderNo || !materialDocumentNo) {
                MessageToast.show("Please enter Process Order No and Material Document No");
                BusyIndicator.hide();
            }
            else {
            var formData = new FormData();
            formData.append("process_no", processOrderNo);
           formData.append("mat_no", materialDocumentNo);
            $.ajax({ 
                url: "/sap/bc/http/sap/ZHTTP_MATERIAL/",
                method: "POST",
                data: formData,
                processData: false,
                contentType: false,
                success: function (result) {
                    // debugger
                    console.log(result)
                    if (result.includes("process_no") || result.includes("mat_no")) {
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
                        //debugger
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
    }
    });
});