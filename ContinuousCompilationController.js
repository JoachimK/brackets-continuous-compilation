/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, setTimeout, clearTimeout */

define(function (require, exports, module) {
    "use strict";
    
    var JSLintError                         = require("JSLintError"),
        JSLINT                              = require("JSLint/jslint"),
        CodeMirrorErrorDisplayController    = require("CodeMirrorErrorDisplayController");
    
    
    var cssClassesForSeverityLevel = {};
    cssClassesForSeverityLevel[JSLintError.SeverityLevelEnum.UNCLASSIFIED] = "cc-JSLint-unclassified-error";
    cssClassesForSeverityLevel[JSLintError.SeverityLevelEnum.SYNTAX_ERROR] = "cc-JSLint-syntax-error";
    cssClassesForSeverityLevel[JSLintError.SeverityLevelEnum.BAD_CODE_OR_PRACTICE] = "cc-JSLint-bad-code-error";
    cssClassesForSeverityLevel[JSLintError.SeverityLevelEnum.WARNING] = "cc-JSLint-warning";
    cssClassesForSeverityLevel[JSLintError.SeverityLevelEnum.JUST_STYLE] = "cc-JSLint-just-style-warning";
    
    
    
        
    function compileCodeAndDisplayErrors(newCodeToCompile) {
        if (newCodeToCompile === null) {
            CodeMirrorErrorDisplayController.setErrorsToDisplay(null);
        } else {
            // If a line contains only whitespace, remove the whitespace
            // This should be doable with a regexp: text.replace(/\r[\x20|\t]+\r/g, "\r\r");,
            // but that doesn't work.
            var i,
                codeToCompileLines,
                linesWithoutCompleteWhitespaceLines = newCodeToCompile.split("\n");
            // JSLint complains about lines that just contain whitespace. We just remove those, because that's really over the top...
            for (i = 0; i < linesWithoutCompleteWhitespaceLines.length; i++) {
                if (!linesWithoutCompleteWhitespaceLines[i].match(/\S/)) {
                    linesWithoutCompleteWhitespaceLines[i] = "";
                }
            }
            //codeToCompile = arr.join("\n");
            codeToCompileLines = linesWithoutCompleteWhitespaceLines;
            
            var passedJSLintCheck = JSLINT(codeToCompileLines, null); // no options => use the default options
            if (passedJSLintCheck) {
                CodeMirrorErrorDisplayController.setErrorsToDisplay(null);
            } else {
                var errorsToDisplay = JSLINT.errors.map(function (errorItem) {
                    if (errorItem === null) {
                        return undefined;
                    } // else
                    return new JSLintError(errorItem, codeToCompileLines);
                });
                errorsToDisplay = errorsToDisplay.filter(function (error) { return error !== undefined; });
                CodeMirrorErrorDisplayController.setErrorsToDisplay(errorsToDisplay);
            }
        }
    }

    
    exports.compileCodeAndDisplayErrors = compileCodeAndDisplayErrors;
    
    exports.setCodeMirrorToAddHighlightsTo = function (codeMirrorToUse) {
        CodeMirrorErrorDisplayController.setCodeMirrorToAddHighlightsTo(codeMirrorToUse);
    };
    
});