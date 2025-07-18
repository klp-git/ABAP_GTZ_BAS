sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'zsampleschedulev01',
            componentId: 'ZC_SAMPLESCHEDULEObjectPage',
            contextPath: '/ZC_SAMPLESCHEDULE'
        },
        CustomPageDefinitions
    );
});