sap.ui.define(['sap/fe/test/ListReport'], function(ListReport) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ListReport(
        {
            appId: 'zsampleschedulev01',
            componentId: 'ZC_SAMPLESCHEDULEList',
            contextPath: '/ZC_SAMPLESCHEDULE'
        },
        CustomPageDefinitions
    );
});