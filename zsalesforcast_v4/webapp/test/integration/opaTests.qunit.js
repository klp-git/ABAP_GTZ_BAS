sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'zsalesforcastv4/test/integration/FirstJourney',
		'zsalesforcastv4/test/integration/pages/SalesForecastList',
		'zsalesforcastv4/test/integration/pages/SalesForecastObjectPage'
    ],
    function(JourneyRunner, opaJourney, SalesForecastList, SalesForecastObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('zsalesforcastv4') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheSalesForecastList: SalesForecastList,
					onTheSalesForecastObjectPage: SalesForecastObjectPage
                }
            },
            opaJourney.run
        );
    }
);