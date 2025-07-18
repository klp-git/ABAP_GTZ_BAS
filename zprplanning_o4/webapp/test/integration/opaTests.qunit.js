sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'zprplanningo4/test/integration/FirstJourney',
		'zprplanningo4/test/integration/pages/PRPlanningList',
		'zprplanningo4/test/integration/pages/PRPlanningObjectPage'
    ],
    function(JourneyRunner, opaJourney, PRPlanningList, PRPlanningObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('zprplanningo4') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onThePRPlanningList: PRPlanningList,
					onThePRPlanningObjectPage: PRPlanningObjectPage
                }
            },
            opaJourney.run
        );
    }
);