sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,MessageBox) {
        "use strict";

        return Controller.extend("zppstickerprint.controller.View1", {
            onInit: function () {
                var fromsticker = this.getView().byId("fromsticker");
                var tosticker = this.getView().byId("tosticker");
                fromsticker.setValue("A");
                tosticker.setValue("H");
            },
            GRPrint:function(){
                
                var beamno = this.getView().byId("beamno").getValue();
                var orderno = this.getView().byId("orderno").getValue();
                var fromsticker = this.getView().byId("fromsticker").getValue();
                var tosticker = this.getView().byId("tosticker").getValue();
            
                if(beamno ===""){
                    MessageBox.error("Please Enter Master card No");
                }
                else if( beamno !='' ){
                var oBusyDialog = new sap.m.BusyDialog({
                    title: "Loading",
                    text: "Please wait"
                });
                oBusyDialog.open();
                // https://my405100.s4hana.cloud.sap:443/sap/bc/http/sap/zpp_card_sticker_http?sap-client=080
                var url1 = "/sap/bc/http/sap/ZHTTP_STICKER_PRINT?";
                var url2 = "&beamno=";
                var url3 = "&orderno=";
                var url6 = "&fromsticker=";
                var url7 = "&tosticker=";
                
               
                var url4 = url2 + beamno;
                var url5 = url3 + orderno;
                var url8 = url6 + fromsticker;
                var url9 = url7 + tosticker;
              
    
                var url = url1 + url4 + url5 + url8 + url9;
    
                // var username = "nvlabap3";
                // var password = "Mike$1245";
                $.ajax({
                    url: url,
                    type: "GET",
                    beforeSend: function (xhr) {
                        xhr.withCredentials = true;
                    },
                    success: function (result) {
                        var decodedPdfContent = atob(result);
                        var byteArray = new Uint8Array(decodedPdfContent.length);
                        for (var i = 0; i < decodedPdfContent.length; i++) {
                            byteArray[i] = decodedPdfContent.charCodeAt(i);
                        }
                        var blob = new Blob([byteArray.buffer], {
                            type: 'application/pdf'
                        });
                        var _pdfurl = URL.createObjectURL(blob);
    
                        if (!this._PDFViewer) {
                            this._PDFViewer = new sap.m.PDFViewer({
                                width: "auto",
                                source: _pdfurl
                            });
                            jQuery.sap.addUrlWhitelist("blob"); // register blob url as whitelist
                        }
                        else
                        {
                            this._PDFViewer = new sap.m.PDFViewer({
                                width: "auto",
                                source: _pdfurl
                            });
                            jQuery.sap.addUrlWhitelist("blob");
                        }
                        oBusyDialog.close();
                        this._PDFViewer.open();
                    }.bind(this)
                });
            }
            },
            handlef4: function () {
                var oBusyDialog = new sap.m.BusyDialog({
                    text: "Please wait"
                });
                oBusyDialog.open();
                var oInput1 = this.getView().byId("orderno");
                var oInput = this.getView().byId("beamno");

                if (!this._oValueHelpDialog) {
                    this._oValueHelpDialog = new sap.ui.comp.valuehelpdialog.ValueHelpDialog("orderno", {
                        supportMultiselect: false,
                        supportRangesOnly: false,
                        enableBasicSearch:"true",
                        stretch: sap.ui.Device.system.phone,
                        keys: "orderno",
                        descriptionKey: "orderno",
                        filtermode: "true",
                        ok: function (oEvent) {
                            var valueset = oEvent.mParameters.tokens[0].mAggregations.customData[0].mProperties.value.ManufacturingOrder;
                            var valueset1 = oEvent.mParameters.tokens[0].mAggregations.customData[0].mProperties.value.Batch;
                            oInput1.setValue(valueset);
                            oInput.setValue(valueset1);
                            this.close();
                        },
                        cancel: function () {
                            this.close();
                        }
                    });
                }


                var oFilterBar = new sap.ui.comp.filterbar.FilterBar({
                    advancedMode: true,
                    filterBarExpanded: true,
                    showClearButton:true,
                    showRestoreButton:true,
                    showFilterConfiguration:true,
                    showClearOnFB:true,
                    isRunningInValueHelpDialog:true,
                    filterGroupItems: [new sap.ui.comp.filterbar.FilterGroupItem({ groupTitle: "foo", groupName: "gn1", name: "n1", label: "Order No.", control: new sap.m.Input() }),
                    new sap.ui.comp.filterbar.FilterGroupItem({ groupTitle: "foo", groupName: "gn1", name: "n2", label: "Beam No.", control: new sap.m.Input() })],




                    search: function (oEvt) {
                        oBusyDialog.open();
                         var oParams = oEvt.getParameter("/cardstickerf4");
                        var ManufacturingOrder = oEvt.mParameters.selectionSet[0].mProperties.value;
                        var Batch = oEvt.mParameters.selectionSet[1].mProperties.value;
                        // if threee no  values 
                        if (Batch === "" && ManufacturingOrder === "") {
                            oTable.bindRows({
                                path: "/cardstickerf4"
                            });
                        }

                        //    if BillingDocument  value is insert then search  under block
                        else if (Batch === "") {
                            oTable.bindRows({
                                path: "/cardstickerf4", filters: [
                                    new sap.ui.model.Filter("ManufacturingOrder", sap.ui.model.FilterOperator.Contains, ManufacturingOrder)]
                            });
                        }

                        //    if BillingDocumentItem  value is insert then search under block
                        else if (ManufacturingOrder === "") {
                            oTable.bindRows({
                                path: "/cardstickerf4", filters: [
                                    new sap.ui.model.Filter("Batch", sap.ui.model.FilterOperator.Contains, Batch)]
                            });
                        }
                        else if (ManufacturingOrder != "" && Batch != "") {
                            oTable.bindRows({
                                path: "/CardStickerF4", filters: [
                                    new sap.ui.model.Filter("Batch", sap.ui.model.FilterOperator.Contains, Batch),
                                    new sap.ui.model.Filter("ManufacturingOrder", sap.ui.model.FilterOperator.Contains, ManufacturingOrder)]
                            });
                        }

                        oBusyDialog.close();
                    }
                });

                this._oValueHelpDialog.setFilterBar(oFilterBar);
                var oColModel = new sap.ui.model.json.JSONModel();
                oColModel.setData({
                    cols: [
                        { label: "Order No.", template: "ManufacturingOrder" },
                        { label: "Beam No.", template: "Batch" },
                        { label: "Product", template: "Product" },
                    ]
                });
                var oTable = this._oValueHelpDialog.getTable();
                oTable.setModel(oColModel, "columns");
                var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZPP_CARD_STICKER_BIN");
                oTable.setModel(oModel);
                oBusyDialog.close();
                this._oValueHelpDialog.open();
            },
            onBack: function () {
                var sPreviousHash = History.getInstance().getPreviousHash();
                if (sPreviousHash !== undefined) {
                    window.history.go(-1);
                } else {
                    this.getOwnerComponent().getRouter().navTo("page1", null, true);
                }
            },
        });
    });
