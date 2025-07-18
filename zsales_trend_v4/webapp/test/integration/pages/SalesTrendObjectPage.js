sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'zsalestrendv4',
            componentId: 'SalesTrendObjectPage',
            contextPath: '/SalesTrend'
        },
        CustomPageDefinitions
    );
});