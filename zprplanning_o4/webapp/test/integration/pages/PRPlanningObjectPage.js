sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'zprplanningo4',
            componentId: 'PRPlanningObjectPage',
            contextPath: '/PRPlanning'
        },
        CustomPageDefinitions
    );
});