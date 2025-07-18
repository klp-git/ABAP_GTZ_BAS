sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'zfipurregb/test/integration/FirstJourney',
		'zfipurregb/test/integration/pages/zpur_reg_ceList',
		'zfipurregb/test/integration/pages/zpur_reg_ceObjectPage'
    ],
    function(JourneyRunner, opaJourney, zpur_reg_ceList, zpur_reg_ceObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('zfipurregb') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onThezpur_reg_ceList: zpur_reg_ceList,
					onThezpur_reg_ceObjectPage: zpur_reg_ceObjectPage
                }
            },
            opaJourney.run
        );
    }
);