sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'zfipurregb',
            componentId: 'zpur_reg_ceObjectPage',
            contextPath: '/zpur_reg_ce'
        },
        CustomPageDefinitions
    );
});