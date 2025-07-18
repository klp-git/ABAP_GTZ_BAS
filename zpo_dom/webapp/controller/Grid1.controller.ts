import Controller from "sap/ui/core/mvc/Controller";
import Dialog from "sap/m/Dialog";
import Button from "sap/m/Button";
import UI5Element from "sap/ui/core/Element";
import JSONModel from "sap/ui/model/json/JSONModel";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import Message from "sap/ui/core/message/Message";
import MessageBox from "sap/m/MessageBox";
import MessageToast from "sap/m/MessageToast";
import PDFViewer from "sap/m/PDFViewer";
import BusyIndicator from "sap/ui/core/BusyIndicator";
import ValueHelpDialog from "sap/ui/comp/valuehelpdialog/ValueHelpDialog";
import Token from "sap/m/Token";
import Input from "sap/m/Input";
import Table from "sap/ui/table/Table";
import Column from "sap/ui/table/Column";
import Text from "sap/m/Text";
/**
 * @namespace zpodom.controller
 */
export default class Grid1 extends Controller {

    private oModel: ODataModel;
    private _PDFViewer: PDFViewer;
    private _oValueHelpDialog: ValueHelpDialog | null = null;

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {

    }
    public onClickPrintDom(): void {
        let view = (this.byId("_IDGenSmartTable")! as any).getTable()
        let selectedIndex = view.getSelectedIndices();
        let fields = view.getContextByIndex(selectedIndex[0]).getProperty();
        console.log(fields);
        let purchaseorder = fields.PurchaseOrder;
        let PurchaseOrderType = fields.PurchaseOrderType;


        //console.log(Bukrs);
        console.log(PurchaseOrderType);
        var payload = {
            purchaseorder: purchaseorder,       // Value from the Input field
        };
        //console.log(Bukrs, Billingdocno);
        var that = this;
        var formData = new FormData();
        formData.append("purchaseorder", purchaseorder);
        var url1 = "/sap/bc/http/sap/ZHTTP_PO_PRINTFORM?sap-client=080";
        var url2 = "&print=";
        var url3 = "&po=";
        var geturlresult = url1 + url2 + 'po_dom' + url3 + purchaseorder;
        var urlresult = url1 + url2 + 'po_dom';
        if (PurchaseOrderType === 'ZRAW' || PurchaseOrderType === 'ZPKG') {
            BusyIndicator.show(0);
            $.ajax({
                url: urlresult,
                method: "POST",
                data: formData,
                processData: false,
                contentType: false,
                success: function (result) {
                    if (result.includes("companycode")) {

                        MessageToast.show(result);
                        BusyIndicator.hide();
                        return;
                    }
                    //console.log(result)
                    if (result.includes("document")) {
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
                },
                error: function (error) {
                    BusyIndicator.hide();
                }
            });
        }
        else {
            if (PurchaseOrderType == 'ZSPA' || PurchaseOrderType === 'ZCMB' || PurchaseOrderType === 'ZCGS' 
                || PurchaseOrderType == 'ZLAB' || PurchaseOrderType == 'ZTLS'
            ) {
                MessageToast.show('Select maintenance PO PrintForm',{ duration: 2000 });
            }
            else if (PurchaseOrderType === 'ZSER') {
                MessageToast.show('Select Service PO PrintForm',{ duration: 2000 });
            }
            else {
                MessageToast.show('Invalid Order Type',{ duration: 2000 });
            }
        }

    }
    public onClickPrintmaintence(): void {
        let view = (this.byId("_IDGenSmartTable")! as any).getTable()
        let selectedIndex = view.getSelectedIndices();
        let fields = view.getContextByIndex(selectedIndex[0]).getProperty();
        console.log(fields);
        let purchaseorder = fields.PurchaseOrder;
        let PurchaseOrderType = fields.PurchaseOrderType;

        //console.log(Bukrs);
        console.log(purchaseorder);
        var payload = {
            purchaseorder: purchaseorder,       // Value from the Input field
        };
        //console.log(Bukrs, Billingdocno);
        var that = this;
        var formData = new FormData();
        formData.append("purchaseorder", purchaseorder);
        var url1 = "/sap/bc/http/sap/ZHTTP_PO_PRINTFORM?sap-client=080";
        var url2 = "&print=";
        var url3 = "&po=";
        var geturlresult = url1 + url2 + 'po_maint' + url3 + purchaseorder;
        var urlresult = url1 + url2 + 'po_maint';

        if (PurchaseOrderType == 'ZSPA' || PurchaseOrderType === 'ZCMB' || PurchaseOrderType === 'ZCGS' 
            || PurchaseOrderType == 'ZLAB' || PurchaseOrderType == 'ZTLS'
        ) {
            BusyIndicator.show(0);
            $.ajax({
                url: urlresult,
                method: "POST",
                data: formData,
                processData: false,
                contentType: false,
                success: function (result) {
                    if (result.includes("companycode")) {

                        MessageToast.show(result);
                        BusyIndicator.hide();
                        return;
                    }
                    //console.log(result)
                    if (result.includes("document")) {
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
                },
                error: function (error) {
                    BusyIndicator.hide();
                }
            });
        }
        else {
            if (PurchaseOrderType === 'ZRAW' || PurchaseOrderType === 'ZPKG') {
                MessageToast.show('Select RM AND PM PO PrintForm',{ duration: 2000 });
            }
            else if (PurchaseOrderType === 'ZSER') {
                MessageToast.show('Select Service PO PrintForm',{ duration: 2000 });
            }
            else {
                MessageToast.show('Invalid Order Type',{ duration: 2000 });
            }
        }

    }
    public onClickPrintservice(): void {
        let view = (this.byId("_IDGenSmartTable")! as any).getTable()
        let selectedIndex = view.getSelectedIndices();
        let fields = view.getContextByIndex(selectedIndex[0]).getProperty();
        console.log(fields);
        let purchaseorder = fields.PurchaseOrder;
        let PurchaseOrderType = fields.PurchaseOrderType;

        //console.log(Bukrs);
        console.log(purchaseorder);
        var payload = {
            purchaseorder: purchaseorder,       // Value from the Input field
        };
        //console.log(Bukrs, Billingdocno);
        var that = this;
        var formData = new FormData();
        formData.append("purchaseorder", purchaseorder);
        var url1 = "/sap/bc/http/sap/ZHTTP_PO_PRINTFORM?sap-client=080";
        var url2 = "&print=";
        var url3 = "&po=";
        var geturlresult = url1 + url2 + 'srv' + url3 + purchaseorder;
        var urlresult = url1 + url2 + 'srv';
        if (PurchaseOrderType === 'ZSER') {
            BusyIndicator.show(0);
            $.ajax({
                url: urlresult,
                method: "POST",
                data: formData,
                processData: false,
                contentType: false,
                success: function (result) {
                    if (result.includes("companycode")) {

                        MessageToast.show(result);
                        BusyIndicator.hide();
                        return;
                    }
                    //console.log(result)
                    if (result.includes("document")) {
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
                },
                error: function (error) {
                    BusyIndicator.hide();
                }
            });
        }
        else {
            if (PurchaseOrderType === 'ZRAW' || PurchaseOrderType === 'ZPKG') {
                MessageToast.show('Select RM AND PM PO PrintForm',{ duration: 2000 });
            }
            else if (PurchaseOrderType == 'ZSPA' || PurchaseOrderType === 'ZCMB' || PurchaseOrderType === 'ZCGS' 
                || PurchaseOrderType == 'ZLAB' || PurchaseOrderType == 'ZTLS'
            ) {
                MessageToast.show('Select maintenance PO PrintForm',{ duration: 2000 });
            }
            else {
                MessageToast.show('Invalid Order Type',{ duration: 2000 });
            }
        }

    }
}