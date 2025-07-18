/*global QUnit*/

sap.ui.define([
	"zfi_dn_cn/controller/grid.controller"
], function (Controller) {
	"use strict";

	QUnit.module("grid Controller");

	QUnit.test("I should test the grid controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
