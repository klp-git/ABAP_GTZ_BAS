/*global QUnit*/
import Controller from "zpodom/controller/Grid1.controller";

QUnit.module("Grid1 Controller");

QUnit.test("I should test the Grid1 controller", function (assert: Assert) {
	const oAppController = new Controller("Grid1");
	oAppController.onInit();
	assert.ok(oAppController);
});