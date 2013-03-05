/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, JSLINT, PathUtils */

define(function (require, exports, module) {
    "use strict";
    
    var JSLintError = require("JSLintError"),
        JSLINT      = require("JSLint/jslint");
    
    var documentToWatch,
        codeToCompileLines,
        linesWithErrorsAndWarnings,
        errorHighlights = [],
        lastStoppedAtLineHandle = null,
        errorMessagesInLines = [];
    
    var severityLevelsToDisplay = [JSLintError.SeverityLevelEnum.SYNTAX_ERROR,
                                    JSLintError.SeverityLevelEnum.UNCLASSIFIED,
                                    JSLintError.SeverityLevelEnum.BAD_CODE_OR_PRACTICE,
                                    JSLintError.SeverityLevelEnum.WARNING,
                                    JSLintError.SeverityLevelEnum.JUST_STYLE];
    
    var cssClassesForSeverityLevel = {};
    cssClassesForSeverityLevel[JSLintError.SeverityLevelEnum.UNCLASSIFIED] = "cc-JSLint-unclassified-error";
    cssClassesForSeverityLevel[JSLintError.SeverityLevelEnum.SYNTAX_ERROR] = "cc-JSLint-syntax-error";
    cssClassesForSeverityLevel[JSLintError.SeverityLevelEnum.BAD_CODE_OR_PRACTICE] = "cc-JSLint-bad-code-error";
    cssClassesForSeverityLevel[JSLintError.SeverityLevelEnum.WARNING] = "cc-JSLint-warning";
    cssClassesForSeverityLevel[JSLintError.SeverityLevelEnum.JUST_STYLE] = "cc-JSLint-just-style-warning";
    
    
    
    function _toggleErrorMessageInLine(codeMirror, lineIndex, gutter) {
        var errorsAndWarningsOnThisLine = linesWithErrorsAndWarnings[lineIndex];
        
        if (errorsAndWarningsOnThisLine === undefined) {
            // no errors to display
            return;
        }
        
        var $lineElementInEditor = $(".CodeMirror:visible .CodeMirror-lines div div:last-child pre:eq(" + lineIndex + ")");
        if (codeMirror.lineInfo(lineIndex).wrapClass && (codeMirror.lineInfo(lineIndex).wrapClass.indexOf("highlightErrorLine") > -1)) {
            codeMirror.removeLineClass(lineIndex, "wrap", "highlightErrorLine");
            errorMessagesInLines[lineIndex].clear();
            errorMessagesInLines[lineIndex] = undefined;
        } else {
            codeMirror.addLineClass(lineIndex, "wrap", "highlightErrorLine");
            
            // create a div that contains all error messages
            var $errorMessageInEditor = $("<div class='cc-JSLint-error-message'/>");
            severityLevelsToDisplay.forEach(function (severityLevel) {
                var errorsOnThisSeverityLevelOnThisLine = errorsAndWarningsOnThisLine[severityLevel];
                if (!errorsOnThisSeverityLevelOnThisLine) {
                    // no errors on this level
                    return;
                }
                errorsOnThisSeverityLevelOnThisLine.forEach(function (errorItem, index, array) {
                    var message = errorItem.reason;
                    message = message.replace(/'(.*)'/g, "<span class='cc-code'>$&</span>");
                    var $messageSpan = $("<span>" + message + "</span>");
                    $messageSpan.addClass(cssClassesForSeverityLevel[severityLevel]);
                    var $errorMessageDiv = $("<div></div>");
                    $errorMessageDiv.append($messageSpan);
                    $errorMessageInEditor.append($errorMessageDiv);
                    
                    // move the error message to the right to position their left border under the error
                    var offsetPosition = errorItem.insertionMarkerPosition || errorItem.startPosition;
                    var offset = codeMirror.cursorCoords(offsetPosition, "local").left;
                    var $offsetSpan = $("<span class='cc-offset'>&nbsp;</span>");
                    $offsetSpan.css("width", offset);
                    
                    $errorMessageDiv.prepend($offsetSpan);
                });
            });
            
            
            var lineWidgetForThisLine = codeMirror.addLineWidget(lineIndex, $errorMessageInEditor[0], {coverGutter: false, noHScroll: false, above: false, showIfHidden: false});
            $errorMessageInEditor.parent().addClass("cc-noscroll");
            
            
            if (errorMessagesInLines[lineIndex] !== undefined) {
                var oldLineWidget = errorMessagesInLines[lineIndex];
                oldLineWidget.clear();
            }
            errorMessagesInLines[lineIndex] = lineWidgetForThisLine;
        }
    }
    
    function _addHighlightMarkerForErrorInEditor(jslintError) {
        var newErrorHighlight;
        var markOptionsForNormalErrorHighlight  = {className: "cc-JSLint-error-highlight " + cssClassesForSeverityLevel[jslintError.severityLevel]},
            markOptionsForStoppedMarkerRight    = {className: "cc-JSLint-error-stopped-right"},
            markOptionsForStoppedMarkerLeft     = {className: "cc-JSLint-error-stopped-left"},
            markOptionsForInsertionMarkerRight  = {className: "cc-JSLint-error-missing-right " + cssClassesForSeverityLevel[jslintError.severityLevel]},
            markOptionsForInsertionMarkerLeft   = {className: "cc-JSLint-error-missing-left " + cssClassesForSeverityLevel[jslintError.severityLevel]};
        
        
        var codeMirror = documentToWatch._masterEditor._codeMirror;
        if (jslintError.type === JSLintError.TypesEnum.STOPPING) {
            // this is the stopping error
            // mark the line after which JSLint stopped
            codeMirror.addLineClass(jslintError.startPosition.line, "wrap", "cc-JSLint-stop-line");
            // and add a marker at the point where it stopped in the line itself
            newErrorHighlight = documentToWatch._masterEditor._codeMirror.markText({line: jslintError.startPosition.line, ch: 0}, jslintError.startPosition, markOptionsForStoppedMarkerRight);
            errorHighlights.push(newErrorHighlight);
            newErrorHighlight = documentToWatch._masterEditor._codeMirror.markText(jslintError.startPosition, {line: jslintError.startPosition.line, ch: jslintError.startPosition.ch + 1}, markOptionsForStoppedMarkerLeft);
            errorHighlights.push(newErrorHighlight);
            return;
        }
        
        // highlight error
        newErrorHighlight = documentToWatch._masterEditor._codeMirror.markText(jslintError.startPosition, jslintError.endPosition, markOptionsForNormalErrorHighlight);
        errorHighlights.push(newErrorHighlight);
        if (jslintError.type === JSLintError.TypesEnum.MISSING) {
            // if it's a highlight for something that's missing. Add classes for the insertion marker.
            // ( the CSS classes are swiched (left assigned to right and vice versa) sine the position indicates the position left (or right) of the insertion point
            //      which means the insertion marker should be displayed on the right (or left) )
            var insertionPos = jslintError.insertionMarkerPosition || jslintError.startPosition;
            newErrorHighlight = documentToWatch._masterEditor._codeMirror.markText({line: insertionPos.line, ch: insertionPos.ch - 1}, insertionPos, markOptionsForInsertionMarkerRight);
            errorHighlights.push(newErrorHighlight);
            newErrorHighlight = documentToWatch._masterEditor._codeMirror.markText(insertionPos, {line: insertionPos.line, ch: insertionPos.ch + 1}, markOptionsForInsertionMarkerLeft);
            errorHighlights.push(newErrorHighlight);
        }
    }
    
    function _clearErrorDisplay() {
        var codeMirror;
        
        if (lastStoppedAtLineHandle) {
            lastStoppedAtLineHandle.bgClassName = null;
            lastStoppedAtLineHandle = null;
        }
        
        if (documentToWatch) {
            documentToWatch._ensureMasterEditor();
            codeMirror = documentToWatch._masterEditor._codeMirror;
        }
        
        // remove displayed error messages
        errorMessagesInLines.forEach(function (lineWidget, lineIndex, array) {
            if (lineWidget) {
                lineWidget.clear();
            }
            if (codeMirror) {
                codeMirror.removeLineClass(lineIndex, "wrap", "highlightErrorLine");
            }
        });
        errorMessagesInLines = [];
        
        // clear error markers in line gutter
        if (codeMirror) {
            codeMirror.clearGutter("CodeMirror-linenumbers");
        }
        
        // remove error highlights
        errorHighlights.forEach(function (anErrorHighlight, index, array) {
            anErrorHighlight.clear();
        });
        errorHighlights = [];
    }
    
    function showCurrentErrors() {
        // reset error markers
        _clearErrorDisplay();
        

        //var $lineNumberBoxesInGutter = $(".CodeMirror:visible .CodeMirror-gutter-text pre");
        
        // add error markers for current errors
        if ((linesWithErrorsAndWarnings !== undefined) && (linesWithErrorsAndWarnings !== null)) {
            var codeMirror = documentToWatch._masterEditor._codeMirror;
            linesWithErrorsAndWarnings.forEach(function (errorsAndWarningsOnThisLine, lineIndex, array) {
                var $lineNumberBoxForError = $("<div class='cc-JSLint-error-in-line CodeMirror-linenumber'/>");
                var containsStoppingError = false;
                var severityLevelsWithErrors = [];
                var firstErrors = {};
                firstErrors[JSLintError.SeverityLevelEnum.SYNTAX_ERROR] = undefined;
                firstErrors[JSLintError.SeverityLevelEnum.UNCLASSIFIED] = undefined;
                firstErrors[JSLintError.SeverityLevelEnum.BAD_CODE_OR_PRACTICE] = undefined;
                firstErrors[JSLintError.SeverityLevelEnum.WARNING] = undefined;
                firstErrors[JSLintError.SeverityLevelEnum.JUST_STYLE] = undefined;
                
                severityLevelsToDisplay.forEach(
                    function (severityLevel) {
                        var errorsForThisLevelOnThisLine = errorsAndWarningsOnThisLine[severityLevel];
                        if (!errorsForThisLevelOnThisLine) {
                            // no errors on this level
                            return;
                        }
                        
                        var $errorMarkerInLineGutter = $("<span/>");
                        $errorMarkerInLineGutter.addClass(cssClassesForSeverityLevel[severityLevel]);
                        $lineNumberBoxForError.append($errorMarkerInLineGutter);
                        
                        var firstErrorOnThisLine = errorsForThisLevelOnThisLine[0];
                        firstErrors[severityLevel] = firstErrorOnThisLine;
                        
                        if (errorsForThisLevelOnThisLine.length === 1) {
                            severityLevelsWithErrors.push(severityLevel);
                            
                            // add marker classes to line-number gutter in editor
                            $errorMarkerInLineGutter.addClass("cc-JSLint-one-error");
                            $lineNumberBoxForError.attr("title", firstErrorOnThisLine.reason);
                            $errorMarkerInLineGutter.text("!");
                            //$lineNumberBoxForError.prepend("<span class='cc-JSLint-error-marker'>!</span>");
                        } else if (errorsForThisLevelOnThisLine.length > 1) {
                            severityLevelsWithErrors.push(severityLevel);
                            
                            $errorMarkerInLineGutter.addClass("cc-JSLint-several-errors");
                            $lineNumberBoxForError.attr("title", errorsForThisLevelOnThisLine.length + " errors. First: " + firstErrorOnThisLine.reason);
                            $errorMarkerInLineGutter.text(errorsForThisLevelOnThisLine.length);
                            //$lineNumberBoxForError.prepend("<span class='cc-JSLint-error-marker'>" + errorsOnThisLine.length + "</span>");
                        }
                        
                        
                        
                        errorsForThisLevelOnThisLine.forEach(function (errorItem, index, array) {
                            if (errorItem.type === JSLintError.TypesEnum.STOPPING) {
                                // add marker class for stopping error to line-number gutter in editor
                                $errorMarkerInLineGutter.addClass("cc-JSLint-stopping-error");
                                containsStoppingError = true;
                            }
                            _addHighlightMarkerForErrorInEditor(errorItem);
                        });
                    }
                );
                
                if (severityLevelsWithErrors.length > 1) {
                    var tooltip = "";
                    tooltip += firstErrors[JSLintError.SeverityLevelEnum.SYNTAX_ERROR] ? "Syntax Errors: " + errorsAndWarningsOnThisLine[JSLintError.SeverityLevelEnum.SYNTAX_ERROR] + ", " : "";
                    tooltip += firstErrors[JSLintError.SeverityLevelEnum.UNCLASSIFIED] ? "Unclassified Errors: " + errorsAndWarningsOnThisLine[JSLintError.SeverityLevelEnum.SYNTAX_ERROR] + ", " : "";
                    tooltip += firstErrors[JSLintError.SeverityLevelEnum.BAD_CODE_OR_PRACTICE] ? "Probable Errors: " + errorsAndWarningsOnThisLine[JSLintError.SeverityLevelEnum.SYNTAX_ERROR] + ", " : "";
                    tooltip += firstErrors[JSLintError.SeverityLevelEnum.WARNING] ? "Warnings: " + errorsAndWarningsOnThisLine[JSLintError.SeverityLevelEnum.SYNTAX_ERROR] + ", " : "";
                    tooltip += firstErrors[JSLintError.SeverityLevelEnum.JUST_STYLE] ? "Style Warnings: " + errorsAndWarningsOnThisLine[JSLintError.SeverityLevelEnum.SYNTAX_ERROR] : "";
                    var firstError = firstErrors[JSLintError.SeverityLevelEnum.SYNTAX_ERROR] || firstErrors[JSLintError.SeverityLevelEnum.UNCLASSIFIED] || firstErrors[JSLintError.SeverityLevelEnum.BAD_CODE_OR_PRACTICE] || firstErrors[JSLintError.SeverityLevelEnum.WARNING];
                    $lineNumberBoxForError.attr("title", tooltip + ". First: " + firstError.reason);
                }
                if (containsStoppingError) {
                    $lineNumberBoxForError.attr("title", "Stopping. " + $lineNumberBoxForError.attr("title"));
                }
                
                $lineNumberBoxForError.append(lineIndex + 1);
                codeMirror.setGutterMarker(lineIndex, "CodeMirror-linenumbers", $lineNumberBoxForError[0]);
                

            });
        }
    }
        
    function _setCodeToCompile(newCodeToCompile) {
        if (newCodeToCompile === null) {
            codeToCompileLines = null;
            linesWithErrorsAndWarnings = null;
        } else {
            // If a line contains only whitespace, remove the whitespace
            // This should be doable with a regexp: text.replace(/\r[\x20|\t]+\r/g, "\r\r");,
            // but that doesn't work.
            var i,
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
                linesWithErrorsAndWarnings = null;
            } else {
                linesWithErrorsAndWarnings = [];
                JSLINT.errors.forEach(function (errorItem, index, array) {
                    if (errorItem === null) {
                        return;
                    }
                    var error = new JSLintError(errorItem, codeToCompileLines);
                    if (linesWithErrorsAndWarnings[error.startPosition.line] === undefined) {
                        linesWithErrorsAndWarnings[error.startPosition.line] = [];
                    }
                    if (linesWithErrorsAndWarnings[error.startPosition.line][error.severityLevel] === undefined) {
                        linesWithErrorsAndWarnings[error.startPosition.line][error.severityLevel] = [];
                    }
                    linesWithErrorsAndWarnings[error.startPosition.line][error.severityLevel].push(error);
                });
            }
        }
        
        showCurrentErrors();
    }
    
    function setDocumentToWatch(newDocumentToWatch) {
        if ((documentToWatch !== undefined) && (documentToWatch !== null)) {
            $(documentToWatch).off("change.ContinuousCompilationController");
            var masterEditor = documentToWatch._masterEditor;
            if (masterEditor) {
                $(masterEditor._codeMirror).off("gutterClick", _toggleErrorMessageInLine);
            }
            documentToWatch.releaseRef();
        }
        
        if (newDocumentToWatch === null) {
            documentToWatch = null;
        } else {
            if (newDocumentToWatch.getLanguage()._name !== "JavaScript") {
                documentToWatch = null;
            } else {
                documentToWatch = newDocumentToWatch;
            }
        }
        
        if (documentToWatch === null) {
            _setCodeToCompile(null);
        } else {
            documentToWatch.addRef();
            $(documentToWatch).on("change.ContinuousCompilationController", function () {
                documentToWatch._ensureMasterEditor();
                documentToWatch._masterEditor._codeMirror.operation(function () {
                    _setCodeToCompile(documentToWatch.getText());
                });
            });
            
            documentToWatch._ensureMasterEditor();
            documentToWatch._masterEditor._codeMirror.on("gutterClick", _toggleErrorMessageInLine);
            
            documentToWatch._masterEditor._codeMirror.operation(function () {
                _setCodeToCompile(documentToWatch.getText());
            });
        }
    }
    
    exports.setDocumentToWatch = setDocumentToWatch;
    exports.showCurrentErrors = showCurrentErrors;
});