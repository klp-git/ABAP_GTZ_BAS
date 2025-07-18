sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'zsalestrendv4/test/integration/FirstJourney',
		'zsalestrendv4/test/integration/pages/SalesTrendList',
		'zsalestrendv4/test/integration/pages/SalesTrendObjectPage'
    ],
    function(JourneyRunner, opaJourney, SalesTrendList, SalesTrendObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('zsalestrendv4') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheSalesTrendList: SalesTrendList,
					onTheSalesTrendObjectPage: SalesTrendObjectPage
                }
            },
            opaJourney.run
        );
    }
);