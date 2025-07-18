sap.ui.define(['sap/fe/test/ListReport'], function(ListReport) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ListReport(
        {
            appId: 'zfipurregb',
            componentId: 'zpur_reg_ceList',
            contextPath: '/zpur_reg_ce'
        },
        CustomPageDefinitions
    );
});