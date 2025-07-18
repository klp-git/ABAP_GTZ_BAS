sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'zsampleschedulev01/test/integration/FirstJourney',
		'zsampleschedulev01/test/integration/pages/ZC_SAMPLESCHEDULEList',
		'zsampleschedulev01/test/integration/pages/ZC_SAMPLESCHEDULEObjectPage'
    ],
    function(JourneyRunner, opaJourney, ZC_SAMPLESCHEDULEList, ZC_SAMPLESCHEDULEObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('zsampleschedulev01') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheZC_SAMPLESCHEDULEList: ZC_SAMPLESCHEDULEList,
					onTheZC_SAMPLESCHEDULEObjectPage: ZC_SAMPLESCHEDULEObjectPage
                }
            },
            opaJourney.run
        );
    }
);