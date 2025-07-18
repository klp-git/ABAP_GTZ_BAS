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
let flag = 1;
/**
 * @namespace zirn.controller
 */
export default class Grid extends Controller {
    private oModel: ODataModel;
    private _PDFViewer: PDFViewer;
    private _oValueHelpDialog: ValueHelpDialog | null = null;
    public Billingdocno: any
    public Bukrs: any

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {
        const oViewModel = new JSONModel({
            textdata: "" // Default: Not editable
        });
        this.getView()?.setModel(oViewModel, "viewModel");
        this.oModel = new ODataModel("/sap/opu/odata/sap/ZSB_ZEWAYBILL/");
        this.oModel.refresh(true);
        const oModel1 = this.getView()?.getModel() as ODataModel;
        if (oModel1) {
            oModel1.refresh(true);
        }
        const oSmartTable = (this.byId("_IDGenSmartTable")! as any);
        if (oSmartTable) {
            oSmartTable.rebindTable();
        }

    }
    private getDialog(): Dialog {
        return this.byId("_IDGenDialog1") as Dialog;
    }
    private getDialog3(): Dialog {
        return this.byId("_IDGenDialog3") as Dialog;
    }
    public onCloseDialog3(): void {
        this.getDialog3().close();
    }

    private getDialog2(): Dialog {
        return this.byId("_IDGenDialog") as Dialog;
    }

    public onClickGenerateData(): void {
        this.getDialog().open();
    }
    public onCloseDialog2(): void {
        this.getDialog2().close();
    }

    public onCloseDialog(): void {
        this.getDialog().close();
    }
    public onGenerateIRNData(): void {
        var oView = this.getView();
        var oPlantInput = (this.byId("idPlantInput")! as any).getValue();
        var oPlantDate = (this.byId("idPlantDate")! as any).getValue();

        //console.log(oPlantInput);
        //console.log(oPlantDate);
        var payload = {
            plant: oPlantInput,       // Value from the Input field
            docdate: oPlantDate  // Value from the DatePicker
        };
        var that = this;
        var formData = new FormData();
        formData.append("plant", oPlantInput);
        formData.append("docdate", oPlantDate);
        BusyIndicator.show(0);
        $.ajax({
            url: "/sap/bc/http/sap/ZHTTP_GENERATEIRN",
            method: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function (result) {
                console.log(result);
                // if (result.includes("companycode")) {
                //     MessageToast.show(result);
                //     BusyIndicator.hide();
                //     return;
                // }
                // if (result.includes("document")) {
                //     MessageToast.show(result);
                //     BusyIndicator.hide();
                //     return;
                // }
            }
        });
        setTimeout(() => {
            (this.byId("idPlantInput")! as any).setValue(""); // Clear text input
            (this.byId("idPlantDate")! as any).setValue("");
            this.oModel = new ODataModel("/sap/opu/odata/sap/ZSB_ZEWAYBILL/");
            this.oModel.refresh(true);

            const oModel1 = this.getView()?.getModel() as ODataModel;
            if (oModel1) {
                oModel1.refresh(true);
            }

            const oSmartTable = (this.byId("_IDGenSmartTable")! as any);
            if (oSmartTable) {
                oSmartTable.rebindTable();
            }
            BusyIndicator.hide();
            this.getDialog().close();
        }, 2000);
    }

    public oncloseEWBDialog() {
        let dialog = this.byId("_IDGenDialog2") as Dialog;
        dialog.close();
    }

    public onClickEWBUpdateOpen() {
        let newModel = new JSONModel();
        let dialog = this.byId("_IDGenDialog2") as Dialog;
        dialog.setModel(newModel, "EWB");
        let view = (this.byId("_IDGenSmartTable")! as any).getTable();
        let selectedIndex = view.getSelectedIndices();
        if (selectedIndex.length <= 0) {
            MessageToast.show("No Item Selected");
            return;
        }
        let fields = view.getContextByIndex(selectedIndex[0]).getProperty();
        if (fields.EwayBillNo) {
            MessageToast.show("Eway Bill already Updated");
            return;
        }
        this.Billingdocno = fields.Billingdocno;
        this.Bukrs = fields.Bukrs;
        dialog.open();
    }

    public onOKEWBDialog() {
        let sPath = `/ZIRN(Bukrs='${this.Bukrs}',Billingdocno='${this.Billingdocno}')`;
        let that = this;
        let dialog = this.byId("_IDGenDialog2") as Dialog;
        let payload = dialog.getModel("EWB")?.getProperty("/");

        this.oModel.update(sPath, {
            ...payload,
            Ewaystatus: "GEN"
        }, {
            headers: {
                "If-Match": "*" // Use "*" if etag is not found (not recommended in strict cases)
            },
            success: function (response: any) {
                console.log("Update Successful");
                BusyIndicator.hide();

                // Refresh the Grid instead of navigating
                let oTable = that.byId("_IDGenSmartTable"); // Get the SmartTable control
                if (oTable) {
                    oTable.getModel()?.refresh(true); // Refresh the model to fetch updated data
                } else {
                    console.warn("SmartTable not found. Unable to refresh.");
                }
                dialog.close();
            },
            error: function (error: any) {
                console.error("Update Failed", error);
            }
        });

    }

    public oncloseIRNDialog() {
        let dialog = this.byId("_IDGenDialog4") as Dialog;
        dialog.close();
    }

    public onClickIRNUpdateOpen() {
        let newModel = new JSONModel();
        let dialog = this.byId("_IDGenDialog4") as Dialog;
        dialog.setModel(newModel, "IRN");
        let view = (this.byId("_IDGenSmartTable")! as any).getTable();
        let selectedIndex = view.getSelectedIndices();
        if (selectedIndex.length <= 0) {
            MessageToast.show("No Item Selected");
            return;
        }
        let fields = view.getContextByIndex(selectedIndex[0]).getProperty();
        if (fields.EwayBillNo) {
            MessageToast.show("IRN already Updated");
            return;
        }
        this.Billingdocno = fields.Billingdocno;
        this.Bukrs = fields.Bukrs;
        dialog.open();
    }

    public onOKIRNDialog() {
        let sPath = `/ZIRN(Bukrs='${this.Bukrs}',Billingdocno='${this.Billingdocno}')`;
        let that = this;
        let dialog = this.byId("_IDGenDialog4") as Dialog;
        let payload = dialog.getModel("IRN")?.getProperty("/");

        this.oModel.update(sPath, {
            ...payload,
            Irnstatus: "GEN"
        }, {
            headers: {
                "If-Match": "*" // Use "*" if etag is not found (not recommended in strict cases)
            },
            success: function (response: any) {
                console.log("Update Successful");
                BusyIndicator.hide();

                // Refresh the Grid instead of navigating
                let oTable = that.byId("_IDGenSmartTable"); // Get the SmartTable control
                if (oTable) {
                    oTable.getModel()?.refresh(true); // Refresh the model to fetch updated data
                } else {
                    console.warn("SmartTable not found. Unable to refresh.");
                }
                dialog.close();
            },
            error: function (error: any) {
                console.error("Update Failed", error);
            }
        });

    }

    public onClickDetails(): void {
        //debugger;
        let that = this;
        let view = (this.byId("_IDGenSmartTable")! as any).getTable()
        let selectedIndex = view.getSelectedIndices();
        let fields = view.getContextByIndex(selectedIndex[0]).getProperty();
        //console.log(fields);
        let Bukrs = fields.Bukrs;
        let Billingdocno = fields.Billingdocno;
        let Moduletype = fields.Moduletype;
        let Plant = fields.Plant
        let Billingdate = fields.Billingdate;
        let Distance = fields.Distance;
        let Vehiclenum = fields.Vehiclenum;
        let newModel = new JSONModel();
        that.getOwnerComponent()?.setModel(newModel, "details");
        newModel.setProperty("/Bukrs", Bukrs);
        newModel.setProperty("/Billingdocno", Billingdocno);
        //newModel.setProperty("/Moduletype", Moduletype);
        newModel.setProperty("/plant", Plant);
        localStorage.setItem("selectedEntryList", JSON.stringify({
            Bukrs: Bukrs,
            Billingdocno: Billingdocno,
            Moduletype: Moduletype,
            Plant: Plant,
            Billingdate: Billingdate,
            Distance: Distance,
            Vehiclenum: Vehiclenum,

        }));
        // let storedData = JSON.parse(localStorage.getItem("selectedEntryList") || "{}");
        // console.log(storedData);
        const router = (this.getOwnerComponent() as any).getRouter();
        router.navTo("Display")
    }
    public onClickIRN(): void {
        var message = '';
        var errormessage = '';
        let that = this;
        let view = (this.byId("_IDGenSmartTable")! as any).getTable()
        let selectedIndex = view.getSelectedIndices();
        let fields = view.getContextByIndex(selectedIndex[0]).getProperty();
        let Bukrs = fields.Bukrs;
        let Billingdocno = fields.Billingdocno;
        var formData = new FormData();
        formData.append("companycode", Bukrs);
        formData.append("document", Billingdocno);
        BusyIndicator.show(0);
        const oViewModel = this.getView()?.getModel("viewModel") as JSONModel;
        $.ajax({
            url: "/sap/bc/http/sap/ZHTTP_IRN",
            method: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function (result) {
                //console.log(result);
                message = result;
                BusyIndicator.hide();
                const oViewModel = that.getView()?.getModel("viewModel") as JSONModel;
                if (oViewModel) {
                    if (message != '') {
                        oViewModel.setProperty("/textdata", message);
                    }
                    if (errormessage != '') {
                        oViewModel.setProperty("/textdata", 'Getting Error while Generating Irn No');
                    }
                } else {
                    console.error("viewModel is not defined");
                }

                that.getDialog2().open();
                that.oModel = new ODataModel("/sap/opu/odata/sap/ZSB_ZEWAYBILL/");
                that.oModel.refresh(true);

                const oModel1 = that.getView()?.getModel() as ODataModel;
                if (oModel1) {
                    oModel1.refresh(true);
                }

                const oSmartTable = (that.byId("_IDGenSmartTable")! as any);
                if (oSmartTable) {
                    oSmartTable.rebindTable();
                }

            },
            error: function (result) {
                BusyIndicator.show(0);
                console.log(result);
                errormessage = 'error';
                BusyIndicator.hide();
                const oViewModel = that.getView()?.getModel("viewModel") as JSONModel;
                if (oViewModel) {
                    if (message != '') {
                        oViewModel.setProperty("/textdata", message);
                    }
                    if (errormessage != '') {
                        oViewModel.setProperty("/textdata", 'Getting Error while Generating Irn No');
                    }
                } else {
                    console.error("viewModel is not defined");
                }

                that.getDialog2().open();
                that.oModel = new ODataModel("/sap/opu/odata/sap/ZSB_ZEWAYBILL/");
                that.oModel.refresh(true);

                const oModel1 = that.getView()?.getModel() as ODataModel;
                if (oModel1) {
                    oModel1.refresh(true);
                }

                const oSmartTable = (that.byId("_IDGenSmartTable")! as any);
                if (oSmartTable) {
                    oSmartTable.rebindTable();
                }

            }
        });
        // setTimeout(() => {
        //     console.log('apratim');
        //     BusyIndicator.hide();
        //     const oViewModel = this.getView()?.getModel("viewModel") as JSONModel;
        //     if (oViewModel) {
        //         if (message != '') {
        //             oViewModel.setProperty("/textdata", message);
        //         }
        //         if (errormessage != '') {
        //             oViewModel.setProperty("/textdata", 'Getting Error while Generating Irn No');
        //         }
        //     } else {
        //         console.error("viewModel is not defined");
        //     }

        //     this.getDialog2().open();
        //     this.oModel = new ODataModel("/sap/opu/odata/sap/ZSB_ZEWAYBILL/");
        //     this.oModel.refresh(true);

        //     const oModel1 = this.getView()?.getModel() as ODataModel;
        //     if (oModel1) {
        //         oModel1.refresh(true);
        //     }

        //     const oSmartTable = (this.byId("_IDGenSmartTable")! as any);
        //     if (oSmartTable) {
        //         oSmartTable.rebindTable();
        //     }
        // }, 5000);
    }

    public onClickCancelIrn(): void {
        var message = '';
        var errormessage = '';
        let that = this;
        let view = (this.byId("_IDGenSmartTable")! as any).getTable()
        let selectedIndex = view.getSelectedIndices();
        let fields = view.getContextByIndex(selectedIndex[0]).getProperty();
        let Bukrs = fields.Bukrs;
        let Billingdocno = fields.Billingdocno;
        var formData = new FormData();
        formData.append("companycode", Bukrs);
        formData.append("document", Billingdocno);
        BusyIndicator.show(0);
        const oViewModel = this.getView()?.getModel("viewModel") as JSONModel;
        $.ajax({
            url: "/sap/bc/http/sap/ZCL_HTTP_CANCELIRN",
            method: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function (result) {
                //console.log(result);
                message = result;
                BusyIndicator.hide();
                const oViewModel = that.getView()?.getModel("viewModel") as JSONModel;
                if (oViewModel) {
                    if (message != '') {
                        oViewModel.setProperty("/textdata", message);
                    }
                    if (errormessage != '') {
                        oViewModel.setProperty("/textdata", 'Getting Error while cancelling Irn No');
                    }
                } else {
                    console.error("viewModel is not defined");
                }

                that.getDialog2().open();
                that.oModel = new ODataModel("/sap/opu/odata/sap/ZSB_ZEWAYBILL/");
                that.oModel.refresh(true);

                const oModel1 = that.getView()?.getModel() as ODataModel;
                if (oModel1) {
                    oModel1.refresh(true);
                }

                const oSmartTable = (that.byId("_IDGenSmartTable")! as any);
                if (oSmartTable) {
                    oSmartTable.rebindTable();
                }

            },
            error: function (result) {
                BusyIndicator.show(0);
                console.log(result);
                errormessage = 'error';
                BusyIndicator.hide();
                const oViewModel = that.getView()?.getModel("viewModel") as JSONModel;
                if (oViewModel) {
                    if (message != '') {
                        oViewModel.setProperty("/textdata", message);
                    }
                    if (errormessage != '') {
                        oViewModel.setProperty("/textdata", 'Getting Error while cancelling Irn No');
                    }
                } else {
                    console.error("viewModel is not defined");
                }

                that.getDialog2().open();
                that.oModel = new ODataModel("/sap/opu/odata/sap/ZSB_ZEWAYBILL/");
                that.oModel.refresh(true);

                const oModel1 = that.getView()?.getModel() as ODataModel;
                if (oModel1) {
                    oModel1.refresh(true);
                }

                const oSmartTable = (that.byId("_IDGenSmartTable")! as any);
                if (oSmartTable) {
                    oSmartTable.rebindTable();
                }

            }
        });
    }
    public onClickCancelEwayBill(): void {
        var message = '';
        var errormessage = '';
        let that = this;
        let view = (this.byId("_IDGenSmartTable")! as any).getTable()
        let selectedIndex = view.getSelectedIndices();
        let fields = view.getContextByIndex(selectedIndex[0]).getProperty();
        let Bukrs = fields.Bukrs;
        let Billingdocno = fields.Billingdocno;
        var formData = new FormData();
        formData.append("companycode", Bukrs);
        formData.append("document", Billingdocno);
        BusyIndicator.show(0);
        const oViewModel = this.getView()?.getModel("viewModel") as JSONModel;
        $.ajax({
            url: "/sap/bc/http/sap/ZCL_HTTP_CANCLEEWB",
            method: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function (result) {
                //console.log(result);
                message = result;
                BusyIndicator.hide();
                const oViewModel = that.getView()?.getModel("viewModel") as JSONModel;
                if (oViewModel) {
                    if (message != '') {
                        oViewModel.setProperty("/textdata", message);
                    }
                    if (errormessage != '') {
                        oViewModel.setProperty("/textdata", 'Getting Error while cancelling EwayBill No');
                    }
                } else {
                    console.error("viewModel is not defined");
                }

                that.getDialog2().open();
                that.oModel = new ODataModel("/sap/opu/odata/sap/ZSB_ZEWAYBILL/");
                that.oModel.refresh(true);

                const oModel1 = that.getView()?.getModel() as ODataModel;
                if (oModel1) {
                    oModel1.refresh(true);
                }

                const oSmartTable = (that.byId("_IDGenSmartTable")! as any);
                if (oSmartTable) {
                    oSmartTable.rebindTable();
                }

            },
            error: function (result) {
                BusyIndicator.show(0);
                console.log(result);
                errormessage = 'error';
                BusyIndicator.hide();
                const oViewModel = that.getView()?.getModel("viewModel") as JSONModel;
                if (oViewModel) {
                    if (message != '') {
                        oViewModel.setProperty("/textdata", message);
                    }
                    if (errormessage != '') {
                        oViewModel.setProperty("/textdata", 'Getting Error while cancelling EwayBill No');
                    }
                } else {
                    console.error("viewModel is not defined");
                }

                that.getDialog2().open();
                that.oModel = new ODataModel("/sap/opu/odata/sap/ZSB_ZEWAYBILL/");
                that.oModel.refresh(true);

                const oModel1 = that.getView()?.getModel() as ODataModel;
                if (oModel1) {
                    oModel1.refresh(true);
                }

                const oSmartTable = (that.byId("_IDGenSmartTable")! as any);
                if (oSmartTable) {
                    oSmartTable.rebindTable();
                }

            }
        });
    }

    public onClickDelete(): void {
        let that = this;
        let view = (this.byId("_IDGenSmartTable")! as any).getTable()
        let selectedIndex = view.getSelectedIndices();
        let fields = view.getContextByIndex(selectedIndex[0]).getProperty();
        let Bukrs = fields.Bukrs;
        let Billingdocno = fields.Billingdocno;
        var payload = {
            companycode: Bukrs,       // Value from the Input field
            document: Billingdocno  // Value from the DatePicker
        };
        $.ajax({
            type: "DELETE",
            url: `/sap/bc/http/sap/ZHTTP_EWAY_GEN2`,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(payload),
            success: function (data, textStatus, request) {
                //debugger;
                //this.onCloseDialog();
                //console.log(data);
                //MessageBox.alert(data);
                //console.log(textStatus);
                //console.log(request);

            },
            error: function (error) {
                //console.log(error)
            }
        })
        setTimeout(() => {
            this.oModel = new ODataModel("/sap/opu/odata/sap/ZSB_ZEWAYBILL/");
            this.oModel.refresh(true);

            const oModel1 = this.getView()?.getModel() as ODataModel;
            if (oModel1) {
                oModel1.refresh(true);
            }

            const oSmartTable = (this.byId("_IDGenSmartTable")! as any);
            if (oSmartTable) {
                oSmartTable.rebindTable();
            }
        }, 1000);
    }

    public onclickdata(): void {
        var message = '';
        var errormessage = '';
        var oView = this.getView();
        var that = this;
        var ovehicleno = (this.byId("_IDGenInput1")! as any).getValue();
        var odistanceno = (this.byId("_IDGenInput3")! as any).getValue();
        let storedData = JSON.parse(localStorage.getItem("selectedEntryList") || "{}");
        const dataModel = new JSONModel(storedData);
        let billdoc = dataModel?.getProperty("/Billingdocno");
        let bukrs = dataModel?.getProperty("/Bukrs");

        var url1 = "/sap/bc/http/sap/ZHTTP_EWAY_GEN1/?sap-client=080";
        var url2 = "&doc=";
        var url3 = "&cc=";
        var url4 = "&dist=";
        var url5 = "&veh=";
        var geturlresult = url1 + url2 + billdoc + url3 + bukrs + url4 + odistanceno +
            url5 + ovehicleno;
        // var payload = {
        //     companycode: bukrs,       // Value from the Input field
        //     document: billdoc  // Value from the DatePicker
        // };
        var formData = new FormData();
        formData.append("companycode", bukrs);
        formData.append("document", billdoc);

        console.log(ovehicleno);
        console.log(odistanceno);
        console.log(billdoc);
        console.log(bukrs);
        console.log("hello");
        this.getDialog3().close();
        BusyIndicator.show(0);
        $.ajax({
            url: geturlresult,
            method: "GET",
            processData: false,
            contentType: false,
            success: function (result) {
                if (result === '1') {
                    $.ajax({
                        url: `/sap/bc/http/sap/ZHTTP_EWAY_GEN1`,
                        method: "POST",
                        data: formData,
                        processData: false,
                        contentType: false,
                        success: function (result) {
                            message = result;
                            BusyIndicator.hide();
                            const oViewModel = that.getView()?.getModel("viewModel") as JSONModel;
                            if (oViewModel) {
                                if (message != '') {
                                    oViewModel.setProperty("/textdata", message);
                                }
                                if (errormessage != '') {
                                    oViewModel.setProperty("/textdata", 'Getting Error while Generating Irn No');
                                }
                            } else {
                                console.error("viewModel is not defined");
                            }

                            that.getDialog2().open();
                            that.oModel = new ODataModel("/sap/opu/odata/sap/ZSB_ZEWAYBILL/");
                            that.oModel.refresh(true);

                            const oModel1 = that.getView()?.getModel() as ODataModel;
                            if (oModel1) {
                                oModel1.refresh(true);
                            }

                            const oSmartTable = (that.byId("_IDGenSmartTable")! as any);
                            if (oSmartTable) {
                                oSmartTable.rebindTable();
                            }

                        },
                        error: function (error) {
                            //errormessage = error;
                            BusyIndicator.hide();
                            const oViewModel = that.getView()?.getModel("viewModel") as JSONModel;
                            if (oViewModel) {
                                if (message != '') {
                                    oViewModel.setProperty("/textdata", message);
                                }
                                if (errormessage != '') {
                                    oViewModel.setProperty("/textdata", 'Getting Error while Eway Bill No');
                                }
                                else {
                                    oViewModel.setProperty("/textdata", 'Getting Error while Eway Bill No');
                                }
                            } else {
                                console.error("viewModel is not defined");
                            }

                            that.getDialog2().open();
                            that.oModel = new ODataModel("/sap/opu/odata/sap/ZSB_ZEWAYBILL/");
                            that.oModel.refresh(true);

                            const oModel1 = that.getView()?.getModel() as ODataModel;
                            if (oModel1) {
                                oModel1.refresh(true);
                            }

                            const oSmartTable = (that.byId("_IDGenSmartTable")! as any);
                            if (oSmartTable) {
                                oSmartTable.rebindTable();
                            }
                        }
                    });
                }
            },
            error: function (error) {
            }
        });
        // setTimeout(() => {
        //     BusyIndicator.hide();
        //     const oViewModel = this.getView()?.getModel("viewModel") as JSONModel;
        //     oViewModel.setProperty("/textdata", message);
        //     if (oViewModel) {
        //         if (message != '') {
        //             oViewModel.setProperty("/textdata", message);
        //         }
        //         if (errormessage != '') {
        //             oViewModel.setProperty("/textdata", 'Getting Error while Generating Irn No');
        //         }
        //     } else {
        //         console.error("viewModel is not defined");
        //     }
        //     this.getDialog2().open();
        //     this.oModel = new ODataModel("/sap/opu/odata/sap/ZSB_ZEWAYBILL/");
        //     this.oModel.refresh(true);

        //     const oModel1 = this.getView()?.getModel() as ODataModel;
        //     if (oModel1) {
        //         oModel1.refresh(true);
        //     }

        //     const oSmartTable = (this.byId("_IDGenSmartTable")! as any);
        //     if (oSmartTable) {
        //         oSmartTable.rebindTable();
        //     }
        // }, 5000);
    }

    public onClickEwayBill(): void {
        let that = this;
        let view = (this.byId("_IDGenSmartTable")! as any).getTable()
        let selectedIndex = view.getSelectedIndices();
        let fields = view.getContextByIndex(selectedIndex[0]).getProperty();
        let Bukrs = fields.Bukrs;
        let Billingdocno = fields.Billingdocno;
        let Moduletype = fields.Moduletype;
        let Plant = fields.Plant
        let Billingdate = fields.Billingdate;
        let Distance = fields.Distance;
        let Vehiclenum = fields.Vehiclenum;
        let newModel = new JSONModel();
        that.getOwnerComponent()?.setModel(newModel, "details");
        newModel.setProperty("/Bukrs", Bukrs);
        newModel.setProperty("/Billingdocno", Billingdocno);
        //newModel.setProperty("/Moduletype", Moduletype);
        newModel.setProperty("/plant", Plant);
        localStorage.setItem("selectedEntryList", JSON.stringify({
            Bukrs: Bukrs,
            Billingdocno: Billingdocno,
            Moduletype: Moduletype,
            Plant: Plant,
            Billingdate: Billingdate,
            Distance: Distance,
            Vehiclenum: Vehiclenum,

        }));
        setTimeout(() => {
            console.log('apratim');
            this.getDialog3().open();
        }, 1000);

        //console.log(Bukrs);
        //console.log(Billingdocno);
        //     var payload = {
        //         companycode: Bukrs,       // Value from the Input field
        //         document: Billingdocno  // Value from the DatePicker
        //     };
        //     $.ajax({
        //         type: "POST",
        //         url: `/sap/bc/http/sap/ZHTTP_EWAY_GEN1`,
        //         contentType: "application/json; charset=utf-8",
        //         dataType: "json",
        //         data: JSON.stringify(payload),
        //         success: function (data, textStatus, request) {
        //             //debugger;
        //             //this.onCloseDialog();
        //             //console.log(data);
        //             //MessageBox.alert(data);
        //             //console.log(textStatus);
        //             //console.log(request);
        //             // MessageToast.show("IRN Data Fetched SuccessFully!", {
        //             //     duration: 3000,    
        //             //     width: "15em",  
        //             //     animationTimingFunction: "ease-in-out"
        //             // });

        //         },
        //         error: function (error) {
        //             //console.log(error);
        //             // MessageToast.show("Error Occurred while fetching!", {
        //             //     duration: 3000,    
        //             //     width: "15em",  
        //             //     animationTimingFunction: "ease-in-out"
        //             // });
        //         }
        //     })
        //     setTimeout(() => {
        //         this.oModel = new ODataModel("/sap/opu/odata/sap/ZSB_ZEWAYBILL/");
        //         this.oModel.refresh(true);

        //         const oModel1 = this.getView()?.getModel() as ODataModel;
        //         if (oModel1) {
        //             oModel1.refresh(true);
        //         }

        //         const oSmartTable = (this.byId("_IDGenSmartTable")! as any);
        //         if (oSmartTable) {
        //             oSmartTable.rebindTable();
        //         }
        //     }, 1500);
    }

    public onClickEwayBillIrn(): void {
        let that = this;
        let view = (this.byId("_IDGenSmartTable")! as any).getTable()
        let selectedIndex = view.getSelectedIndices();
        let fields = view.getContextByIndex(selectedIndex[0]).getProperty();
        let Bukrs = fields.Bukrs;
        let Billingdocno = fields.Billingdocno;
        //console.log(Bukrs);
        //console.log(Billingdocno);
        var payload = {
            companycode: Bukrs,       // Value from the Input field
            document: Billingdocno  // Value from the DatePicker
        };
        $.ajax({
            type: "POST",
            url: `/sap/bc/http/sap/ZHTTP_EWAYBILLBYIRN`,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(payload),
            success: function (data, textStatus, request) {
                //debugger;
                //this.onCloseDialog();
                //console.log(data);
                //MessageBox.alert(data);
                //console.log(textStatus);
                //console.log(request);
                // MessageToast.show("IRN Data Fetched SuccessFully!", {
                //     duration: 3000,    
                //     width: "15em",  
                //     animationTimingFunction: "ease-in-out"
                // });

            },
            error: function (error) {
                //console.log(error);
                // MessageToast.show("Error Occurred while fetching!", {
                //     duration: 3000,    
                //     width: "15em",  
                //     animationTimingFunction: "ease-in-out"
                // });
            }
        })
        setTimeout(() => {
            this.oModel = new ODataModel("/sap/opu/odata/sap/ZSB_ZEWAYBILL/");
            this.oModel.refresh(true);

            const oModel1 = this.getView()?.getModel() as ODataModel;
            if (oModel1) {
                oModel1.refresh(true);
            }

            const oSmartTable = (this.byId("_IDGenSmartTable")! as any);
            if (oSmartTable) {
                oSmartTable.rebindTable();
            }
        }, 1500);
    }
    public onClickPrintForm(): void {
        let view = (this.byId("_IDGenSmartTable")! as any).getTable()
        let selectedIndex = view.getSelectedIndices();
        let fields = view.getContextByIndex(selectedIndex[0]).getProperty();
        let Bukrs = fields.Bukrs;
        let Billingdocno = fields.Billingdocno;
        let Distributionchannel = fields.distributionchannel;
        let Billingdocumenttype = fields.billingdocumenttype;


        //console.log(Bukrs);
        console.log(fields);
        var payload = {
            companycode: Bukrs,       // Value from the Input field
            document: Billingdocno  // Value from the DatePicker
        };
        //console.log(Bukrs, Billingdocno);
        var that = this;
        var formData = new FormData();
        formData.append("document", Billingdocno);
        formData.append("companycode", Bukrs);
        var url1 = "/sap/bc/http/sap/ZHTTP_ZEWAYBILL_PRINTFORM/?sap-client=080";
        var url2 = "&print=";
        var url3 = "&doc=";
        var url4 = "&cc=";
        var geturlresult = url1 + url2 + 'dom' + url3 + Billingdocno + url4 + Bukrs;
        var urlresult = url1 + url2 + 'dom';
        $.ajax({
            url: geturlresult,
            method: "GET",
            data: formData,
            processData: false,
            contentType: false,
            success: function (result) {
                if (result === '11' || result === '16' || result === '12' && (Billingdocumenttype !== 'CBRE' || Billingdocumenttype !== 'G2' || Billingdocumenttype !== 'L2')) {
                    BusyIndicator.show(0);
                    $.ajax({
                        url: urlresult,
                        method: "POST",
                        data: formData,
                        processData: false,
                        contentType: false,
                        success: function (result) {
                            console.log(result);
                            if (result.includes("companycode")) {

                                MessageToast.show(result);
                                BusyIndicator.hide();
                                return;
                            }
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
                    if (Billingdocumenttype === 'CBRE' || Billingdocumenttype === 'G2' || Billingdocumenttype === 'L2') {
                        MessageToast.show('Kindly Select Credit Debit Note Invoice', { duration: 2000 });
                    }
                    else {
                        if (Distributionchannel === '13' || Distributionchannel === '21') {
                            MessageToast.show('Kindly Select Foc Tax Invoice', { duration: 2000 });
                        }
                        if (Distributionchannel === '15') {
                            MessageToast.show('Kindly Select Service Sale Invoice', { duration: 2000 });
                        }
                        if (Distributionchannel === '20' || Distributionchannel === '22') {
                            MessageToast.show('Kindly Select Export Tax Invoice', { duration: 2000 });
                        }
                        if (Distributionchannel === '14' && Billingdocumenttype === 'JVR') {
                            MessageToast.show('Kindly Select Rm Return Invoice', { duration: 2000 });
                        }
                        else {
                            if (Distributionchannel === '14') {
                                MessageToast.show('Kindly Select STO Tax Invoice', { duration: 2000 });
                            }
                        }
                    }
                    // MessageToast.show('Kindly Select Domestic Tax Invoice', { duration: 2000 });
                }
            }
        });
    }

    public onClickPrintForm2(): void {
        let view = (this.byId("_IDGenSmartTable")! as any).getTable()
        let selectedIndex = view.getSelectedIndices();
        let fields = view.getContextByIndex(selectedIndex[0]).getProperty();
        let Bukrs = fields.Bukrs;
        let Billingdocno = fields.Billingdocno;
        let Distributionchannel = fields.distributionchannel;
        let Billingdocumenttype = fields.billingdocumenttype;

        //console.log(Bukrs);
        //console.log(Billingdocno);
        var payload = {
            companycode: Bukrs,       // Value from the Input field
            document: Billingdocno  // Value from the DatePicker
        };
        //console.log(Bukrs, Billingdocno);
        var that = this;
        var formData = new FormData();
        formData.append("document", Billingdocno);
        formData.append("companycode", Bukrs);
        var url1 = "/sap/bc/http/sap/ZHTTP_ZEWAYBILL_PRINTFORM/?sap-client=080";
        var url2 = "&print=";
        var url3 = "&doc=";
        var url4 = "&cc=";
        var geturlresult = url1 + url2 + 'sto' + url3 + Billingdocno + url4 + Bukrs;
        var urlresult = url1 + url2 + 'sto';
        $.ajax({
            url: geturlresult,
            method: "GET",
            data: formData,
            processData: false,
            contentType: false,
            success: function (result) {
                if (result === '14' && (Billingdocumenttype !== 'CBRE' || Billingdocumenttype !== 'G2' || Billingdocumenttype !== 'L2')) {
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
                    if (Billingdocumenttype === 'CBRE' || Billingdocumenttype === 'G2' || Billingdocumenttype === 'L2') {
                        MessageToast.show('Kindly Select Credit Debit Note Invoice', { duration: 2000 });
                    }
                    else {
                        if (Distributionchannel === '11' || Distributionchannel === '12' || Distributionchannel === '16') {
                            MessageToast.show('Kindly Select Domestic Tax Invoice', { duration: 2000 });
                        }
                        if (Distributionchannel === '13' || Distributionchannel === '21') {
                            MessageToast.show('Kindly Select Foc Tax Invoice', { duration: 2000 });
                        }
                        if (Distributionchannel === '15') {
                            MessageToast.show('Kindly Select Service Sale Invoice', { duration: 2000 });
                        }
                        if (Distributionchannel === '20' || Distributionchannel === '22') {
                            MessageToast.show('Kindly Select Export Tax Invoice', { duration: 2000 });
                        }
                        if (Distributionchannel === '14' && Billingdocumenttype === 'JVR') {
                            MessageToast.show('Kindly Select Rm Return invoice', { duration: 2000 });
                        }
                    }
                }
            }
        });

    }
    public onClickPrintForm3(): void {
        let view = (this.byId("_IDGenSmartTable")! as any).getTable()
        let selectedIndex = view.getSelectedIndices();
        let fields = view.getContextByIndex(selectedIndex[0]).getProperty();
        let Bukrs = fields.Bukrs;
        let Billingdocno = fields.Billingdocno;
        let Distributionchannel = fields.distributionchannel;
        let Billingdocumenttype = fields.billingdocumenttype;

        //console.log(Bukrs);
        //console.log(Billingdocno);
        var payload = {
            companycode: Bukrs,       // Value from the Input field
            document: Billingdocno  // Value from the DatePicker
        };
        //console.log(Bukrs, Billingdocno);
        var that = this;
        var formData = new FormData();
        formData.append("document", Billingdocno);
        formData.append("companycode", Bukrs);
        var url1 = "/sap/bc/http/sap/ZHTTP_ZEWAYBILL_PRINTFORM/?sap-client=080";
        var url2 = "&print=";
        var url3 = "&doc=";
        var url4 = "&cc=";
        var geturlresult = url1 + url2 + 'expo' + url3 + Billingdocno + url4 + Bukrs;
        var urlresult = url1 + url2 + 'expo';
        $.ajax({
            url: geturlresult,
            method: "GET",
            data: formData,
            processData: false,
            contentType: false,
            success: function (result) {
                if (result === '20' || result === '22' && (Billingdocumenttype !== 'CBRE' || Billingdocumenttype !== 'G2' || Billingdocumenttype !== 'L2')) {
                    BusyIndicator.show(0);
                    $.ajax({
                        url: urlresult,
                        method: "POST",
                        data: formData,
                        processData: false,
                        contentType: false,
                        success: function (result) {
                            console.log(result);
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
                    if (Billingdocumenttype === 'CBRE' || Billingdocumenttype === 'G2' || Billingdocumenttype === 'L2') {
                        MessageToast.show('Kindly Select Credit Debit Note Invoice', { duration: 2000 });
                    }
                    else {
                        if (Distributionchannel === '11' || Distributionchannel === '12' || Distributionchannel === '16') {
                            MessageToast.show('Kindly Select Domestic Tax Invoice', { duration: 2000 });
                        }
                        if (Distributionchannel === '13' || Distributionchannel === '21') {
                            MessageToast.show('Kindly Select Foc Tax Invoice', { duration: 2000 });
                        }
                        if (Distributionchannel === '15') {
                            MessageToast.show('Kindly Select Service Sale Invoice', { duration: 2000 });
                        }
                        if (Distributionchannel === '14' && Billingdocumenttype === 'JVR') {
                            MessageToast.show('Kindly Select Rm Return Invoice', { duration: 2000 });
                        }
                        else {
                            if (Distributionchannel === '14') {
                                MessageToast.show('Kindly Select STO Tax Invoice', { duration: 2000 });
                            }
                        }
                    }
                }
            }
        });

    }
    public onClickPrintForm4(): void {
        let view = (this.byId("_IDGenSmartTable")! as any).getTable()
        let selectedIndex = view.getSelectedIndices();
        let fields = view.getContextByIndex(selectedIndex[0]).getProperty();
        let Bukrs = fields.Bukrs;
        let Billingdocno = fields.Billingdocno;
        let Distributionchannel = fields.distributionchannel;
        let Billingdocumenttype = fields.billingdocumenttype;

        //console.log(Bukrs);
        //console.log(Billingdocno);
        var payload = {
            companycode: Bukrs,       // Value from the Input field
            document: Billingdocno  // Value from the DatePicker
        };
        //console.log(Bukrs, Billingdocno);
        var that = this;
        var formData = new FormData();
        formData.append("document", Billingdocno);
        formData.append("companycode", Bukrs);
        var url1 = "/sap/bc/http/sap/ZHTTP_ZEWAYBILL_PRINTFORM/?sap-client=080";
        var url2 = "&print=";
        var url3 = "&doc=";
        var url4 = "&cc=";
        var geturlresult = url1 + url2 + 'cndn' + url3 + Billingdocno + url4 + Bukrs;
        var urlresult = url1 + url2 + 'cndn';
        $.ajax({
            url: geturlresult,
            method: "GET",
            data: formData,
            processData: false,
            contentType: false,
            success: function (result) {
                console.log(result);
                if (result === 'CBRE' || result === 'G2' || result === 'L2' ||
                    result === "cbre" || result === 'g2' || result === 'l2'
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
                    if (Distributionchannel === '11' || Distributionchannel === '12' || Distributionchannel === '16') {
                        MessageToast.show('Kindly Select Domestic Tax Invoice', { duration: 2000 });
                    }
                    if (Distributionchannel === '13' || Distributionchannel === '21') {
                        MessageToast.show('Kindly Select Foc Tax Invoice', { duration: 2000 });
                    }
                    if (Distributionchannel === '15') {
                        MessageToast.show('Kindly Select Service Sale Invoice', { duration: 2000 });
                    }
                    if (Distributionchannel === '20' || Distributionchannel === '22') {
                        MessageToast.show('Kindly Select Export Tax Invoice', { duration: 2000 });
                    }
                    if (Distributionchannel === '14' && Billingdocumenttype === 'JVR') {
                        MessageToast.show('Kindly Select Credit Debit Note Invoice', { duration: 2000 });
                    }
                    else {
                        if (Distributionchannel === '14') {
                            MessageToast.show('Kindly Select STO Tax Invoice', { duration: 2000 });
                        }
                    }
                    //MessageToast.show('Kindly Select Credit Debit Note Invoice', { duration: 2000 });
                }
            }
        });

    }

    public onClickPrintForm5(): void {
        let view = (this.byId("_IDGenSmartTable")! as any).getTable()
        let selectedIndex = view.getSelectedIndices();
        let fields = view.getContextByIndex(selectedIndex[0]).getProperty();
        let Bukrs = fields.Bukrs;
        let Billingdocno = fields.Billingdocno;
        let Distributionchannel = fields.distributionchannel;
        let Billingdocumenttype = fields.billingdocumenttype;
        //console.log(Bukrs);
        //console.log(Billingdocno);
        var payload = {
            companycode: Bukrs,       // Value from the Input field
            document: Billingdocno  // Value from the DatePicker
        };
        //console.log(Bukrs, Billingdocno);
        var that = this;
        var formData = new FormData();
        formData.append("document", Billingdocno);
        formData.append("companycode", Bukrs);
        var url1 = "/sap/bc/http/sap/ZHTTP_ZEWAYBILL_PRINTFORM/?sap-client=080";
        var url2 = "&print=";
        var url3 = "&doc=";
        var url4 = "&cc=";
        var geturlresult = url1 + url2 + 'foc' + url3 + Billingdocno + url4 + Bukrs;
        var urlresult = url1 + url2 + 'foc';
        $.ajax({
            url: geturlresult,
            method: "GET",
            data: formData,
            processData: false,
            contentType: false,
            success: function (result) {
                console.log(result);
                if (result === '13' || result === '21' && (Billingdocumenttype !== 'CBRE' || Billingdocumenttype !== 'G2' || Billingdocumenttype !== 'L2')) {
                    BusyIndicator.show(0);
                    $.ajax({
                        url: urlresult,
                        method: "POST",
                        data: formData,
                        processData: false,
                        contentType: false,
                        success: function (result) {
                            console.log(result);
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
                    if (Billingdocumenttype === 'CBRE' || Billingdocumenttype === 'G2' || Billingdocumenttype === 'L2') {
                        MessageToast.show('Kindly Select Credit Debit Note Invoice', { duration: 2000 });
                    }
                    else {
                        if (Distributionchannel === '11' || Distributionchannel === '12' || Distributionchannel === '16') {
                            MessageToast.show('Kindly Select Domestic Tax Invoice', { duration: 2000 });
                        }
                        if (Distributionchannel === '15') {
                            MessageToast.show('Kindly Select Service Sale Invoice', { duration: 2000 });
                        }
                        if (Distributionchannel === '20' || Distributionchannel === '22') {
                            MessageToast.show('Kindly Select Export Tax Invoice', { duration: 2000 });
                        }
                        if (Distributionchannel === '14' && Billingdocumenttype === 'JVR') {
                            MessageToast.show('Kindly Select Rm Return Invoice', { duration: 2000 });
                        }
                        else {
                            if (Distributionchannel === '14') {
                                MessageToast.show('Kindly Select STO Tax Invoice', { duration: 2000 });
                            }
                        }
                    }
                    // MessageToast.show('Kindly Select Foc Invoice', { duration: 2000 });
                }
            }
        });

    }
    public onClickPrintForm6(): void {
        let view = (this.byId("_IDGenSmartTable")! as any).getTable()
        let selectedIndex = view.getSelectedIndices();
        let fields = view.getContextByIndex(selectedIndex[0]).getProperty();
        let Bukrs = fields.Bukrs;
        let Billingdocno = fields.Billingdocno;
        let Billingdocumenttype = fields.billingdocumenttype;
        let Distributionchannel = fields.distributionchannel;
        console.log(fields);
        //console.log(Bukrs);
        //console.log(Billingdocno);
        var payload = {
            companycode: Bukrs,       // Value from the Input field
            document: Billingdocno  // Value from the DatePicker
        };
        //console.log(Bukrs, Billingdocno);
        var that = this;
        var formData = new FormData();
        formData.append("document", Billingdocno);
        formData.append("companycode", Bukrs);
        var url1 = "/sap/bc/http/sap/ZHTTP_ZEWAYBILL_PRINTFORM/?sap-client=080";
        var url2 = "&print=";
        var url3 = "&doc=";
        var url4 = "&cc=";
        var geturlresult = url1 + url2 + 'rm' + url3 + Billingdocno + url4 + Bukrs;
        var urlresult = url1 + url2 + 'rm';
        $.ajax({
            url: geturlresult,
            method: "GET",
            data: formData,
            processData: false,
            contentType: false,
            success: function (result) {
                console.log(result);
                if (result === 'JVR' || result === 'jvr') {
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
                    if (Billingdocumenttype === 'CBRE' || Billingdocumenttype === 'G2' || Billingdocumenttype === 'L2') {
                        MessageToast.show('Kindly Select Credit Debit Note Invoice', { duration: 2000 });
                    }
                    else {
                        if (Distributionchannel === '11' || Distributionchannel === '12' || Distributionchannel === '16') {
                            MessageToast.show('Kindly Select Domestic Tax Invoice', { duration: 2000 });
                        }
                        if (Distributionchannel === '13' || Distributionchannel === '21') {
                            MessageToast.show('Kindly Select Foc Tax Invoice', { duration: 2000 });
                        }
                        if (Distributionchannel === '15') {
                            MessageToast.show('Kindly Select Service Sale Invoice', { duration: 2000 });
                        }
                        if (Distributionchannel === '20' || Distributionchannel === '22') {
                            MessageToast.show('Kindly Select Export Tax Invoice', { duration: 2000 });
                        }
                        if (Distributionchannel === '14' && Billingdocumenttype !== 'JVR') {
                            MessageToast.show('Kindly Select STO Tax Invoice', { duration: 2000 });
                        }
                    }

                    // MessageToast.show('Kindly Select Rm Return Invoice', { duration: 2000 });
                }
            }
        });

    }
    public onClickPrintForm7(): void {
        let view = (this.byId("_IDGenSmartTable")! as any).getTable()
        let selectedIndex = view.getSelectedIndices();
        let fields = view.getContextByIndex(selectedIndex[0]).getProperty();
        let Bukrs = fields.Bukrs;
        let Billingdocno = fields.Billingdocno;
        let Distributionchannel = fields.distributionchannel;
        let Billingdocumenttype = fields.billingdocumenttype;

        //console.log(Bukrs);
        //console.log(Billingdocno);
        var payload = {
            companycode: Bukrs,       // Value from the Input field
            document: Billingdocno  // Value from the DatePicker
        };
        //console.log(Bukrs, Billingdocno);
        var that = this;
        var formData = new FormData();
        formData.append("document", Billingdocno);
        formData.append("companycode", Bukrs);
        var url1 = "/sap/bc/http/sap/ZHTTP_ZEWAYBILL_PRINTFORM/?sap-client=080";
        var url2 = "&print=";
        var url3 = "&doc=";
        var url4 = "&cc=";
        var geturlresult = url1 + url2 + 'ss' + url3 + Billingdocno + url4 + Bukrs;
        var urlresult = url1 + url2 + 'ss';
        $.ajax({
            url: geturlresult,
            method: "GET",
            data: formData,
            processData: false,
            contentType: false,
            success: function (result) {
                console.log(result);
                if (result === '15' || result === '15' && (Billingdocumenttype === 'CBRE' || Billingdocumenttype === 'G2' || Billingdocumenttype === 'L2')) {
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
                    if (Billingdocumenttype === 'CBRE' || Billingdocumenttype === 'G2' || Billingdocumenttype === 'L2') {
                        MessageToast.show('Kindly Select Credit Debit Note Invoice', { duration: 2000 });
                    }
                    else {
                        if (Distributionchannel === '11' || Distributionchannel === '12' || Distributionchannel === '16') {
                            MessageToast.show('Kindly Select Domestic Tax Invoice', { duration: 2000 });
                        }
                        if (Distributionchannel === '13' || Distributionchannel === '21') {
                            MessageToast.show('Kindly Select Foc Tax Invoice', { duration: 2000 });
                        }
                        if (Distributionchannel === '20' || Distributionchannel === '22') {
                            MessageToast.show('Kindly Select Export Tax Invoice', { duration: 2000 });
                        }
                        if (Distributionchannel === '14' && Billingdocumenttype === 'JVR') {
                            MessageToast.show('Kindly Select Export Tax Invoice', { duration: 2000 });
                        }
                        else {
                            if (Distributionchannel === '14') {
                                MessageToast.show('Kindly Select STO Tax Invoice', { duration: 2000 });
                            }
                        }
                    }

                }
            }
        });

    }

    public onClickPrintBatch(): void {
        let view = (this.byId("_IDGenSmartTable")! as any).getTable()
        let selectedIndex = view.getSelectedIndices();
        let fields = view.getContextByIndex(selectedIndex[0]).getProperty();
        let Bukrs = fields.Bukrs;
        let Billingdocno = fields.Billingdocno;
        let Distributionchannel = fields.distributionchannel;
        let Billingdocumenttype = fields.billingdocumenttype;

        //console.log(Bukrs);
        //console.log(Billingdocno);
        var payload = {
            companycode: Bukrs,       // Value from the Input field
            document: Billingdocno  // Value from the DatePicker
        };
        //console.log(Bukrs, Billingdocno);
        var that = this;
        var formData = new FormData();
        formData.append("document", Billingdocno);
        formData.append("companycode", Bukrs);
        var url1 = "/sap/bc/http/sap/ZHTTP_ZEWAYBILL_PRINTFORM/?sap-client=080";
        var url2 = "&print=";
        var url3 = "&doc=";
        var url4 = "&cc=";
        // var geturlresult = url1 + url2 + 'ss' + url3 + Billingdocno + url4 + Bukrs;
        var urlresult = url1 + url2 + 'batch';
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

    public onClickPrintFocExport(): void {
        let view = (this.byId("_IDGenSmartTable")! as any).getTable()
        let selectedIndex = view.getSelectedIndices();
        let fields = view.getContextByIndex(selectedIndex[0]).getProperty();
        let Bukrs = fields.Bukrs;
        let Billingdocno = fields.Billingdocno;
        let Distributionchannel = fields.distributionchannel;
        let Billingdocumenttype = fields.billingdocumenttype;

        //console.log(Bukrs);
        //console.log(Billingdocno);
        var payload = {
            companycode: Bukrs,       // Value from the Input field
            document: Billingdocno  // Value from the DatePicker
        };
        //console.log(Bukrs, Billingdocno);
        var that = this;
        var formData = new FormData();
        formData.append("document", Billingdocno);
        formData.append("companycode", Bukrs);
        var url1 = "/sap/bc/http/sap/ZHTTP_ZEWAYBILL_PRINTFORM/?sap-client=080";
        var url2 = "&print=";
        var url3 = "&doc=";
        var url4 = "&cc=";
        // var geturlresult = url1 + url2 + 'ss' + url3 + Billingdocno + url4 + Bukrs;
        var urlresult = url1 + url2 + 'focexport';
        if (Distributionchannel === '21') {
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
            if (Billingdocumenttype === 'CBRE' || Billingdocumenttype === 'G2' || Billingdocumenttype === 'L2') {
                MessageToast.show('Kindly Select Credit Debit Note Invoice', { duration: 2000 });
            }
            else {
                if (Distributionchannel === '11' || Distributionchannel === '12' || Distributionchannel === '16') {
                    MessageToast.show('Kindly Select Domestic Tax Invoice', { duration: 2000 });
                }
                if (Distributionchannel === '13') {
                    MessageToast.show('Kindly Select Foc Tax Invoice', { duration: 2000 });
                }
                if (Distributionchannel === '15') {
                    MessageToast.show('Kindly Select Service Sale Invoice', { duration: 2000 });
                }
                if (Distributionchannel === '14' && Billingdocumenttype === 'JVR') {
                    MessageToast.show('Kindly Select Rm Return Invoice', { duration: 2000 });
                }
                else {
                    if (Distributionchannel === '14') {
                        MessageToast.show('Kindly Select STO Tax Invoice', { duration: 2000 });
                    }
                }
            }
        }
    }

    public onEditToggle(): void {
        // const oViewModel = this.getView()?.getModel("viewModel") as JSONModel;
        // if (oViewModel) {
        //     oViewModel.setProperty("/isEditable", true);
        // } else {
        //     console.error("viewModel is not defined");
        // }
        let that = this;
        let view = (this.byId("_IDGenSmartTable")! as any).getTable();
        let selectedIndex = view.getSelectedIndices();
        //console.log(selectedIndex);
    }
    public onSaveChanges(): void {
        const oViewModel = this.getView()?.getModel("viewModel") as JSONModel;
        if (oViewModel) {
            oViewModel.setProperty("/isEditable", false);
        } else {
            console.error("viewModel is not defined");
        }
    }
    public onValueHelpRequest(): void {
        const oView = this;
        if (!this._oValueHelpDialog) {
            this._oValueHelpDialog = new ValueHelpDialog({
                title: "Plant",
                supportMultiselect: false, // Single selection
                key: "Plant",
                // descriptionKey: "PlantName",
                ok: (oEvent) => {
                    const aTokens = oEvent.getParameter("tokens") as Token[];
                    // (this.byId("_IDGenSmartTable")! as any)
                    if (aTokens.length > 0) {
                        (oView.byId("idPlantInput")! as Input).setValue(aTokens[0].getText());
                    }
                    this._oValueHelpDialog?.close();
                },
                cancel: () => {
                    this._oValueHelpDialog?.close();
                }
            });
            const oTable = this._oValueHelpDialog.getTable() as Table;

            // Create an OData Model (Replace with your OData service URL)
            const oModel = new ODataModel("/sap/opu/odata/sap/ZSB_ZEWAYBILL");
            oTable.setModel(oModel);

            // Bind table to OData entity set (Replace with your actual entity set)
            oTable.bindRows({
                path: "/ZVHPLANT"
            });

            // Add columns dynamically
            oTable.addColumn(new Column({
                label: new Text({ text: "Plant" }),
                template: new Text({ text: "{Plant}" })
            }));
            oTable.addColumn(new Column({
                label: new Text({ text: "Plant Name" }),
                template: new Text({ text: "{PlantName}" })
            }));
        }

        // Open the Value Help Dialog
        this._oValueHelpDialog.open();
    }
}