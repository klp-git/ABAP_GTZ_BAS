/* @sapUiRequire */
QUnit.config.autostart = false;

// import all your QUnit tests here
void Promise.all([
	import("sap/ui/core/Core"), // required to wait until Core has booted to start the QUnit tests
	import("unit/controller/GridPage.controller"),
]).then(([{default: Core}]) => Core.ready()).then(() => {
	QUnit.start();
});