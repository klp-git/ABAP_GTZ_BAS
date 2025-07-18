import Controller from "sap/ui/core/mvc/Controller";
import Dialog from "sap/m/Dialog";
import Button from "sap/m/Button";
import UI5Element from "sap/ui/core/Element";
import JSONModel from "sap/ui/model/json/JSONModel";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import UpdateMethod from "sap/ui/model/odata/UpdateMethod";
import Fragment from "sap/ui/core/Fragment";
import Input from "sap/m/Input";
/**
 * @namespace zirn.controller
 */
export default class Display extends Controller {
    public onInit(): void {

        let storedData = JSON.parse(localStorage.getItem("selectedEntryList") || "{}");
        const dataModel = new JSONModel(storedData);
        console.log(dataModel);
        this.getView()?.setModel(dataModel, "myModel");
        //console.log(this.getView());
    }
    public onsave(): void {
        let storedData = JSON.parse(localStorage.getItem("selectedEntryList") || "{}");
        const dataModel = new JSONModel(storedData);
        let billdoc = dataModel?.getProperty("/Billingdocno");
        let bukrs = dataModel?.getProperty("/Bukrs");
        let oInputVehicle = (this.byId("_IDGenInput")! as any);
        let oInputDist = (this.byId("_IDGenInput2")! as any);
        var url1 = "/sap/bc/http/sap/ZHTTP_EWAY_GEN1/?sap-client=080";
        var url2 = "&doc=";
        var url3 = "&cc=";
        var url4 = "&dist=";
        var url5 = "&veh=";
        var geturlresult = url1 + url2 + billdoc + url3 + bukrs + url4 + oInputDist.getValue() +
            url5 + oInputVehicle.getValue();
        var payload = {
            companycode: bukrs,       // Value from the Input field
            document: billdoc  // Value from the DatePicker
        };
        $.ajax({
            url: geturlresult,
            method: "GET",
            processData: false,
            contentType: false,
            success: function (result) {
                if (result === '1') {
                    $.ajax({
                        type: "POST",
                        url: `/sap/bc/http/sap/ZHTTP_EWAY_GEN1`,
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
                        const router = (this.getOwnerComponent() as any).getRouter();
                        router.navTo("Grid");
                    }, 1500);
                }
            },
            error: function (error) {

            }
        });

    }

}