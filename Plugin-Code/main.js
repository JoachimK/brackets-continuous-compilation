/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, CodeMirror, brackets, less, $, XMLHttpRequest, document */

define(function (require, exports, module) {
    'use strict';
    var AppInit                         = brackets.getModule("utils/AppInit");
    var EditorManager                   = brackets.getModule("editor/EditorManager");
    var DocumentManager                 = brackets.getModule("document/DocumentManager");
    var Editor                          = brackets.getModule('editor/Editor');
    var TextRange                       = brackets.getModule('document/TextRange').TextRange;
    var ExtensionUtils                  = brackets.getModule("utils/ExtensionUtils");
    var ContinuousCompilationController = require("ContinuousCompilationController");
    
    
    
    // initialization
    console.log("loading continuos compilation!");
    ExtensionUtils.loadStyleSheet(module, "main.less");
    
    
    // called when the current document changes
    function _setupContinuousCompilationForChangedDocument(theEvent) {
        ContinuousCompilationController.setDocumentToWatch(DocumentManager.getCurrentDocument());
    }
    
    AppInit.appReady(function () {
        $(DocumentManager).on("currentDocumentChange.ContinuousCompilation", _setupContinuousCompilationForChangedDocument);
        _setupContinuousCompilationForChangedDocument(null);
    });
});