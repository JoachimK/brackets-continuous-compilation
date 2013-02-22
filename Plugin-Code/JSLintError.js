/*jslint devel: true, regexp: true, nomen: true, indent: 4, todo: true */
/*global define, $, JSLINT */

define(function (require, exports, module) {
    "use strict";
    
    function _regExpEscape(str) {
        var specials = new RegExp("[.*+?|()\\[\\]{}\\\\]", "g"); // .*+?|()[]{}\
        return str.replace(specials, "\\$&");
    }
    
    function JSLintError(jslintError, codeLines) {
        this.startPosition = {
            line: jslintError.line - 1, // starts at 1 but we need it to start at 0
            ch: jslintError.character - 1 // starts at 1, but we need it to start at 0
        };
        this.evidence = jslintError.evidence;
        this.message_id = jslintError.message_id;
        this.raw = jslintError.raw;
        this.reason = jslintError.reason;
        this.a = jslintError.a;
        this.b = jslintError.b;
        this.c = jslintError.c;
        this.d = jslintError.d;
        this.type = JSLintError.TypesEnum.DEFAULT;
        this.correctStartPositionAndCalculateEndPosition(codeLines);
        this.classifyError();
    }
    
    JSLintError.TypesEnum = Object.freeze({ DEFAULT : 0, MISSING : 1, STOPPING : 2});
    
    JSLintError.SeverityLevelEnum = Object.freeze({UNCLASSIFIED : 0, SYNTAX_ERROR : 1, BAD_CODE_OR_PRACTICE : 2, WARNING: 3, JUST_STYLE: 4});
    
    JSLintError.prototype.classifyError = function () {
        // First some special cases
        if ((this.message_id === "expected_a_b") && (this.a === ";")) {
            // a missing semicolon is not always a syntax error, depending on the browser
            // but it should be fixed anyway.
            this.severityLevel = JSLintError.SeverityLevelEnum.SYNTAX_ERROR;
            return;
        }
        
        if ((this.message_id === "unexpected_a") && (this.a === "(space)")) {
            // an unexpected space is just a style problem
            this.severityLevel = JSLintError.SeverityLevelEnum.JUST_STYLE;
            return;
        }
        
        
        switch (this.message_id) {
        // SYNTAX ERROR
        case "bad_assignment":
        case "bad_invocation": // in some cases this works, in some it doesn't. ( `"test"()` is wrong. But `(a = function () {})()` works). We classify it as syntax error to be sure 
        case "expected_a_b": // something is wrong ^^
        case "expected_a_b_from_c_d": // likely a syntax error, although I couldn't reproduce it completely.
        case "expected_identifier_a": // JSLint seems to stop after this kind of error, and the only examples I found were actually syntax errors
        case "expected_identifier_a_reserved": // not sure if syntax error or just really stupid. Even if it compiles, it shouldn't.
        case "function_statement":
        case "missing_property":
        case "name_function":
        case "nested_comment":
        case "not_a_label":
        case "reserved_a": // not sure if syntax error or just really stupid. Even if it compiles, it shouldn't.
        case "unclosed":
        case "unclosed_comment":
        case "unclosed_regexp":
        case "unescaped_a":
        case "used_before_a": // not strictly a syntax error, WOULD compile, but really bad style if meant like that, and usually just a typo. We handle it as if it was mistyped.
            this.severityLevel = JSLintError.SeverityLevelEnum.SYNTAX_ERROR;
            break;
                
        // BAD_CODE_OR_PRATICE
        case "a_label":
        case "assign_exception":
        case "bad_in_a":
        case "bad_new":
        case "conditional_assignment":
        case "confusing_a":
        case "deleted":
        case "duplicate_a":
        case "empty_class":
        case "evil":
        case "expected_string_a": // only example I could find: `(typeof b === c)` complains about c not being a string. Is probably bad style but will work.
        case "for_if": // will compile, but is probably a bad idea
        case "function_eval":
        case "function_loop": // although it compiles doing this is often a sign of not understanding closure. Also it creates a new function object with each iteration.
        case "implied_evil": // eval(), just worse
        case "isNaN": // comparing to NaN will always give false even (NaN == NaN) is false, so this is most likely a programming error
        case "label_a_b": // don't use labels on non-loop statements. What are you trying to do?
        case "missing_a": // only found "missing new", that's likely an oversight and programming error
        case "missing_a_after_b": // only found "missing break", that's at least bad practice, often an error
        case "not_a_constructor": // Compiles and doesn't crash, but it likely doesn't do what you expect (e.g. ("test" === new String("test")) is false)
        case "read_only": // Compiles, doesn't destroy anything, but is still wrong
        case "statement_block": // Using a block (without if, a loop or similar) indicates that you believe that Javascript has block scoping. That is not the case and probably leads to errors.
        case "unexpected_a": // Not sure what this is, but it probably shouldn't be here
        case "unexpected_property_a": // This property probably doesn't exist
        case "unreachable_a_b": // most likely a programming error
        case "use_array": // it's bad practice because Array(2,3) is [2,3], Array("2") is ["2"], but Array(2) is an array of length 2 without values.
        case "use_braces": // bad style
        case "use_param": // why would you use arguments[i] if you have a name for the parameter?! Trying to confuse people?
        case "var_a_not": // bad style, although it seems to work
        case "weird_new": // likely something wrong
        case "wrap_immediate": // otherwise it looks as if a function is assigned, which is not the case and makes understanding the code a lot harder
        case "write_is_wrong": // document.write can be a form of eval
            this.severityLevel = JSLintError.SeverityLevelEnum.BAD_CODE_OR_PRATICE;
            break;
                
        // WARNING
        case "already_defined":
        case "and":
        case "assignment_function_expression":
        case "bad_wrap":
        case "constructor_name_a":
        case "empty_block":
        case "empty_case":
        case "function_block": // not a problem in a simple if or similar. But is a problem if two functions with the same name are declared in if and else block.
        case "function_strict": // may lead to interferences with other files importing this one. Global context and stuff.
        case "html_handlers":
        case "infix_in": // sometimes even warranted: http://stackoverflow.com/questions/6824895/jslint-error-unexpected-in-compare-with-undefined-or-use-the-hasownproperty
        case "insecure_a":
        case "missing_use_strict": // you probably want to use strict
        case "move_var": // often leads to errors
        case "radix": // not a great idea, but often works
        case "strange_loop": // not a great idea, but often works
        case "strict": // using this in a "non-method" often leads to errors
        case "unnecessary_initialize": // indicates programmer doesn't understand what he's doing, but it's not harmful
        case "weird_assignment":
        case "weird_condition":
        case "weird_relation":
        case "weird_ternary":
            this.severityLevel = JSLintError.SeverityLevelEnum.WARNING;
            break;
        
        // JUST_STYLE
        case "combine_var":
        case "dangling_a":
        case "expected_a_at_b_c":
        case "expected_space_a_b":
        case "leading_decimal_a":
        case "trailing_decimal_a":
        case "missing_space_a_b":
        case "mixed":
        case "move_invocation":
        case "slash_equal": // works fine, confusing it with something like a/= 2; might be an issues, but with syntax highlighting that's usually not a problem.
        case "subscript":
        case "too_long":
        case "unexpected_space_a_b":
        case "unnecessary_use":
        case "use_object": // seems to be a question of style: http://www.jameswiseman.com/blog/2011/01/19/jslint-messages-use-the-object-literal-notation/
        case "use_or": // seems to be a matter of style to me. I think b ? b : defaultValue is easier to understand than b || defaultValue.
        case "wrap_regexp":
            this.severityLevel = JSLintError.SeverityLevelEnum.JUST_STYLE;
            break;
                
        // UNCLASSIFIED:
        case "a_not_allowed":   // does not seem to be used in current implementation
        case "a_not_defined":   // does not seem to be used in current implementation
        case "a_scope":         // Could not reproduce
        case "adsafe_a":        // all the adsafe thing are unclassified for now
        case "adsafe_autocomplete":
        case "adsafe_bad_id":
        case "adsafe_div":
        case "adsafe_fragment":
        case "adsafe_go":
        case "adsafe_html":
        case "adsafe_id":
        case "adsafe_id_go":
        case "adsafe_lib":
        case "adsafe_lib_second":
        case "adsafe_missing_id":
        case "adsafe_name_a":
        case "adsafe_placement":
        case "adsafe_prefix_a":
        case "adsafe_script":
        case "adsafe_source":
        case "adsafe_subscript_a":
        case "adsafe_tag":
        case "attribute_case_a":    // Could not reproduce it
        case "avoid_a":             // Could not reproduce it
        case "bad_color_a":         // whatever
        case "bad_constructor":     // Could not reproduce it
        case "bad_entity":          // whatever
        case "bad_html":            // whatever
        case "bad_id_a":            // whatever
        case "bad_name_a":          // Could not reproduce it
        case "bad_number":          // Could not reproduce it
        case "bad_operand":         // Could not reproduce it
        case "bad_style":           // something about CSS?
        case "bad_type":            // something about HTML input fields?
        case "bad_url_a":           // something about HTML <a href>?
        case "control_a":           // Could not reproduce it
        case "confusing_regexp":    // Could not reproduce it
        case "css":                 // whatever
        case "dangerous_comment":   // not sure what that means
        case "es5":                 // not handled yet
        case "expected_a":          // Not sure, what kind of things would appear here. Likely different levels?
        case "expected_at_a":       // No clue what that is
        case "expected_attribute_a":// HTML stuff?
        case "expected_attribute_value_a":// HTML stuff?
        case "expected_class_a":    // HTML stuff?
        case "expected_fraction_a": // CSS stuff?
        case "expected_id_a":       // CSS stuff?
        case "expected_linear_a":   // whatever
        case "expected_lang_a":     // HTML/CSS stuff?
        case "expected_media_a":    // CSS stuff?
        case "expected_name_a":     // CSS stuff?
        case "expected_nonstandard_style_attribute": // CSS stuff?
        case "expected_number_a":   // CSS stuff?
        case "expected_operator_a": // CSS stuff?
        case "expected_percent_a":  // CSS stuff?
        case "expected_positive_a": // CSS stuff?
        case "expected_pseudo_a":   // CSS stuff?
        case "expected_selector_a": // CSS stuff?
        case "expected_small_a":    // CSS stuff?
        case "expected_style_attribute": // CSS stuff?
        case "expected_style_pattern": // CSS stuff?
        case "expected_tagname_a":  // CSS stuff?
        case "expected_type_a":     // not sure what this is about
        case "html_confusion_a":    // only in mixed HTML/JS files?
        case "identifier_function": // Could not reproduce it
        case "lang":                // HTML stuff?
        case "missing_option":      // does not seem to be used in current implementation
        case "missing_url":         // HTML/CSS stuff?
        case "not":                 // Could not reproduce it
        case "not_a_defined":       // Could not reproduce it
        case "not_a_function":      // Could not reproduce it
        case "not_a_scope":         // Could not reproduce it
        case "not_greater":         // Could not reproduce it
        case "parameter_a_get_b":   // ES5 stuff
        case "parameter_set_a":     // ES5 stuff
        case "redefinition_a":      // does not seem to be used in current implementation
        case "scanned_a_b":         // Think this doesn't appear in reality. Just as part of an error message.
        case "stopping":            // Think this doesn't appear in reality. Just as part of an error message.
        case "too_many":            // Think this doesn't appear in reality. Just as part of an error message.
        case "tag_a_in_b":          // HTML stuff?
        case "type":                // HTML stuff?
        case "unexpected_char_a_b": // Could not reproduce it
        case "unexpected_comment":  // No clue
        case "unrecognized_style_attribute_a": // HTML/CSS stuff?
        case "unrecognized_tag_a":  // HTML/ stuff?
        case "unsafe":              // Could not reproduce it
        case "url":                 // Could not reproduce it
        case "use_charAt":          // Could not reproduce it
        case "weird_program":       // Could not reproduce it
            this.severityLevel = JSLintError.SeverityLevelEnum.UNCLASSIFIED;
            break;
                
        default:
            console.log("Unknown error type: '" + this.message_id + "' with message: " + this.raw);
            this.severityLevel = JSLintError.SeverityLevelEnum.UNCLASSIFIED;
        }
    };
    
    // function that is used for calculating the highlighting range for an erroneuos string, if the calculation is straightforward
    JSLintError.prototype.calculateSimpleStartAndEndPosition = function (stringToSearchForParam) {
        var stringToTest                = this.evidence.substr(this.startPosition.ch),
            stringToSearchFor           = stringToSearchForParam || this.a, // use the given stringToSearchForParam, if none is given use this.a
            indexOfStringToSearchFor    = stringToTest.indexOf(stringToSearchFor);
        if (indexOfStringToSearchFor > -1) {
            // found it, highlight it
            this.startPosition.ch += indexOfStringToSearchFor;
            this.endPosition = {line: this.startPosition.line, ch: this.startPosition.ch + stringToSearchFor.length};
        } else {
            // just highlight the character the error is pointing to
            this.endPosition = {line: this.startPosition.line, ch: this.startPosition.ch + 1};
        }
    };
    
    JSLintError.prototype.correctStartPositionAndCalculateEndPosition = function (codeLines) {
        var stringToTest,
            stringToSearchFor,
            stringA,    // string representation of this.a if needed
            stringB,    // string representation of this.b if needed
            
            indexOfStringToSearchFor,
            
            match,
            previousMatch,
            
            newErrorHighlight,
        
            whitespaceRegex                     = /\s+/g,
            whitespaceWithOptionalCommentsRegex = /\s*(\/\/.*)?/, // this matches a line with leading whitespace and then a single line (//) comment. I would have liked to use [:print:] instead of "." , but that's not available.
            originalStartingPosition            = {line: this.startPosition.line, ch: this.startPosition.ch},
            findSpacesBetweenStringsRegex,  // has to be created anew each time depending on the strings to find
            underscoreRegex                     = /_+/g,
            regexForLineWithOnlyClosingBlockBracketPossiblyFollowedByAComment   = /\s*\}\s*(\/\/.*|\/\*.*)?/, // a closing }, possibly with leading and trailing whitespace and/or trailing comments. I would have liked to use [:print:] instead of ".", but that's not available
            whitespaceWithTwoOptionalOtherCharactersRegex                       = /\s*\S?\S?/,
            whitespaceWithOptionalCommentFollowedByAClosingBracketRegex         = /\s*(\/\*.*\*\/)?\s*\}/g,
            regexForCaseAndArgument                                             = /case.*:/, // a "case" followed by something, ending with a ":". Using "." because [:print:] is not available
            copmpleteLoopBodyOnThisLineRegex                                    = /(for\s*\(.+\s+in\s+.+\)\s*\{)([^}]+)\}/,
            optionalWhitespaceWithOptionalCommentsRegex                         = /\s*(\/[*\/].*)?/, // optional whitespace, optionally followed by ("//" or "/*") and anything 
            undefinedInitializationRegex; // has to be created anew each time depending on the strings to find
        
        if (this.raw === undefined) {
            // this is the stopping error
            // just highlight one character, the one after it stopped
            this.type = JSLintError.TypesEnum.STOPPING;
            this.endPosition = this.startPosition;
            return;
        }
        
        if (this.raw === "Expected to see a statement and instead saw a block.") {
            // Sine Javascript has no block-scoping, introducing blocks that do not belong to loops, if-statements or functions does not make sense
            // But in this case, the error points to the first token after the opening {. We want to highlight the opening { so we have to find it first.
            stringToTest = this.evidence.substring(0, this.startPosition.ch); // only take the line UP TO the character the error points to, because the bracket has to be before that.
            stringToSearchFor = "{";
            indexOfStringToSearchFor = stringToTest.indexOf(stringToSearchFor);
            while ((indexOfStringToSearchFor === -1) && (this.startPosition.line > 0)) {
                this.startPosition.line -= 1;
                stringToTest = codeLines[this.startPosition.line];
                indexOfStringToSearchFor = stringToTest.indexOf(stringToSearchFor);
            }
            if (indexOfStringToSearchFor > -1) {
                this.startPosition.ch = indexOfStringToSearchFor;
                this.endPosition = {line: this.startPosition.line, ch: this.startPosition.ch + stringToSearchFor.length};
            } else {
                // couldn't find a function keyword, go back to the start and use the default highlight
                this.startPosition = originalStartingPosition;
                this.calculateSimpleStartAndEndPosition();
            }
            return;
        }
        // else
        
        if ((this.b === undefined) && (this.raw.indexOf("Expected") === 0)) {
            // the default highlight will work fine
            this.calculateSimpleStartAndEndPosition();
            // this is the case for the following erro messages
            //  Expected an at-rule, and instead saw @{a}.
            //  Expected an attribute, and instead saw [{a}].
            //  Expected an attribute value and instead saw '{a}'.
            //  Expected a class, and instead saw .{a}.
            //  Expected a number between 0 and 1 and instead saw '{a}'
            //  Expected an id, and instead saw #{a}.
            //  Expected an identifier and instead saw '{a}'.
            //  Expected an identifier and instead saw '{a}' (a reserved word).
            //  Expected a linear unit and instead saw '{a}'.
            //  Expected a lang code, and instead saw :{a}.
            //  Expected a CSS media type, and instead saw '{a}'.
            //  Expected a name and instead saw '{a}'.
            //  Expected a non-standard style attribute and instead saw '{a}'.
            //  Expected a number and instead saw '{a}'.
            //  Expected an operator and instead saw '{a}'.
            //  Expected a percentage and instead saw '{a}'
            //  Expected a positive number and instead saw '{a}'
            //  Expected a pseudo, and instead saw :{a}.
            //  Expected a CSS selector, and instead saw {a}.
            //  Expected a small positive integer and instead saw '{a}'
            //  Expected a string and instead saw {a}.
            //  Excepted a style attribute, and instead saw '{a}'.
            //  Expected a style pattern, and instead saw '{a}'.
            //  Expected a tagName, and instead saw {a}.
            //  Expected a type, and instead saw {a}.
            
            // some special handling
            if ((this.raw === "Expected '{a}'.")
                    || (this.raw === "Expected an identifier and instead saw '{a}'.")) {
                // This is a kind of missing. Add an insertion marker.
                this.type = JSLintError.TypesEnum.MISSING;
                // For a "missing error" we just insert an insertion marker at the "missing" position
                // therefore start and end position for the highlight are the same
                this.endPosition = this.startPosition;
            }
            return;
        }
        // else
        
        if (this.raw === "Unexpected '{a}'.") {
            if (this.a === "(space)") {
                stringToTest = this.evidence.substr(this.startPosition.ch);
                // find the infringing space
                match = whitespaceRegex.exec(stringToTest);
                this.startPosition.ch += match.index;
                this.endPosition = {line: this.startPosition.line, ch: this.startPosition.ch + match[0].length};
            } else {
                this.calculateSimpleStartAndEndPosition();
            }
            return;
        }
        // else
        
        if ((this.raw === "Missing space between '{a}' and '{b}'.")
                || (this.raw === "Expected exactly one space between '{a}' and '{b}'.")
                || (this.raw === "Unexpected space between '{a}' and '{b}'.")) { // we handle those three together since they overlap
            stringToTest = this.evidence; // use the complete line, since we don't know how long the {a} is and the character index points to the point after {a}
            stringA = String(this.a);
            stringB = String(this.b);
            
            /*jslint vars: true */
            var missingSpace = false,
                subIndexOfStringToSearchFor;
            /*jslint vars: false */
            
            if (this.raw === "Missing space between '{a}' and '{b}'.") {
                missingSpace = true;
            } else if (this.raw === "Expected exactly one space between '{a}' and '{b}'.") {
                // In this case, we don't know whether a space is missing or there are too many spaces. Try to find that out.
                // If there is a space missing we should find this.a and this.b next to each other in this line around the given position
                stringToSearchFor = stringA + stringB;
                indexOfStringToSearchFor = stringToTest.indexOf(stringToSearchFor);
                while (this.startPosition.ch > indexOfStringToSearchFor + stringToSearchFor.length) {
                    stringToTest = this.evidence.substr(indexOfStringToSearchFor + stringToSearchFor.length);
                    subIndexOfStringToSearchFor = stringToTest.indexOf(stringToSearchFor);
                    if (subIndexOfStringToSearchFor === -1) {
                        break; // if we didn't find another match, stop
                    }
                    indexOfStringToSearchFor += stringToSearchFor.length + subIndexOfStringToSearchFor;
                }
                if ((indexOfStringToSearchFor > -1) && (this.startPosition.ch > indexOfStringToSearchFor)) {
                    missingSpace = true;
                }
            }
            
            // calculate the positions depending on the situation
            if (missingSpace) {
                // This something is missing here, we use an insertion marker as highlight.
                this.type = JSLintError.TypesEnum.MISSING;
                // Therefore, start and end position are the same.
                // The the start position was already given by JSLint as the place to put the insertion marker
                this.endPosition = this.startPosition;
            } else {
                // This means, we are in the case where we actually have too many spaces.
                // so we have to find the superfluous spaces and underline them.
                findSpacesBetweenStringsRegex = new RegExp("(" + _regExpEscape(stringA) + ")(\\s+)(" + _regExpEscape(stringB) + ")", "g");
                match = findSpacesBetweenStringsRegex.exec(stringToTest);
                while ((match !== null) && (this.startPosition.ch > match.index + match[0].length)) {
                    previousMatch = match;
                    match = findSpacesBetweenStringsRegex.exec(stringToTest);
                }
                if (match === null) { match = previousMatch; }
                if (match !== undefined) {
                    /*jslint vars: true */
                    var numberOfSpacesToKeep = 0;
                    /*jslint vars: false */
                    if (this.raw === "Expected exactly one space between '{a}' and '{b}'.") {
                        numberOfSpacesToKeep = 1;
                    }
                    this.startPosition.ch = match.index + stringA.length + numberOfSpacesToKeep; // + this.a.length is the part before the spaces, then we add the number of spaces to keep.
                    this.endPosition = {line: this.startPosition.line, ch: this.startPosition.ch + (match[2].length - numberOfSpacesToKeep)}; // match[2] should contain the spaces, if we want to keep some of those we substract the correct number
                } else {
                    this.calculateSimpleStartAndEndPosition();
                }
            }
            return;
        }
        // else
        
        if (this.raw === "Strange loop.") {
            // use the complete line, since the "character" pointer usually points to the semicolon at the end of the line
            // but we want to capture the whole "break;" statement if that is the infringement
            stringToTest = this.evidence;
            
            // usually this error is due to an incorrect "break;", therefore we look for a "break;" and underline that
            // we assume that there will only be one break in a line. If there is more than one there are probably other issues...
            stringToSearchFor = "break;";
            indexOfStringToSearchFor = stringToTest.indexOf(stringToSearchFor);
            if (indexOfStringToSearchFor > -1) {
                // found a break
                this.startPosition.ch = indexOfStringToSearchFor;
                this.endPosition = {line: this.startPosition.line, ch: this.startPosition.ch + stringToSearchFor.length};
            } else {
                // found no break, highlight just whatever it is that is in jslintError.a and indicated by the character index
                this.calculateSimpleStartAndEndPosition();
            }
            return;
        }
        // else
        
        if (this.raw === "Expected an assignment or function call and instead saw an expression.") {
            // These are examples such as
            // a;
            // a + b;
            // a && b.push(a);
            //
            // jslint only provides the correct highlight for the first case
            // But usually the complete line is the problem, or rather a missing assignment, therefore we highlight the complete line without the leading whitespace
            indexOfStringToSearchFor = this.evidence.search(/\S/);
            this.startPosition.ch = indexOfStringToSearchFor;
            this.endPosition = {line: this.startPosition.line, ch : this.evidence.length};
            return;
        }
        // else
        
        if (this.raw === "Do not use 'new' for side effects.") {
            // This error occurs when an object created with "new" is not stored in a variable or passed as a parameter, but seemingly thrown away.
            // Such a use indictaes the reliance on side effects of new.
            // The default highlight would highlight the semicolon at the end of the line, but it makes more sense to highlight the new itself.
            stringToSearchFor = "new";
            indexOfStringToSearchFor = this.evidence.indexOf(stringToSearchFor); // we just take the first occurence and hope it's the correct one
            this.startPosition.ch = indexOfStringToSearchFor;
            this.endPosition = {line: this.startPosition.line, ch: this.startPosition.ch + stringToSearchFor.length};
            return;
        }
        // else
        
        if (this.raw === "Unexpected dangling '_' in '{a}'.") {
            // The default highlight underlines the complete variable. But it would be better to just underline the underscore.
            stringToTest = this.evidence.substr(this.startPosition.ch);
            
            match = underscoreRegex.exec(stringToTest);
            this.startPosition.ch += match.index;
            this.endPosition = {line: this.startPosition.line, ch: this.startPosition.ch + match[0].length};
            return;
        }
        // else
        
        if (this.raw === "Only properties should be deleted.") {
            // In this case the character position in the error points to the next character AFTER the erroneous statement, e.g.
            stringToTest = this.evidence;
            indexOfStringToSearchFor = stringToTest.indexOf("delete");
            if (indexOfStringToSearchFor === -1) { indexOfStringToSearchFor = 0; }
            this.startPosition.ch = indexOfStringToSearchFor;
            this.endPosition = {line: this.startPosition.line, ch: originalStartingPosition.ch};
            return;
        }
        // else
        
        if (this.raw === "Duplicate '{a}'.") {
            // A "duplicate" error occurs in a case such as this: var a = {foo: "bar", foo: 2};
            // The problem here is, that the character position will in that case point to the closing bracket or whatever other character comes after the assignment of the second foo.
            // Even worse: In this case:
            //  var a = {
            //      foo : "bar",
            //      foo : 2
            //  }
            // i.e. if the next character is a newline character, the character position will point to the NEXT line after that, in that case to the closing bracket
            // We want to fix that.
            stringToTest = this.evidence;
            indexOfStringToSearchFor = stringToTest.lastIndexOf(this.a); // last index, since the last apperance is likely at fault
            if (indexOfStringToSearchFor >= 0) {
                // found it in this line
                this.startPosition.ch = indexOfStringToSearchFor;
                this.endPosition = {line: this.startPosition.line, ch: this.startPosition.ch + this.a.length};
            } else {
                // check the previous line
                stringToTest = codeLines[this.startPosition.line - 1]; // -1 because we want the previous line
                indexOfStringToSearchFor = stringToTest.indexOf(this.a);
                if (indexOfStringToSearchFor >= 0) {
                    this.startPosition = {line: this.startPosition.line - 1, ch: indexOfStringToSearchFor};
                    this.endPosition = {line: this.startPosition.line, ch: this.startPosition.ch + this.a.length};
                } else {
                    // use the default calculation, we didn't find the correct thing to highlight
                    this.calculateSimpleStartAndEndPosition();
                }
            }
            // TODO: In a scenario such as this one: var a = {foo : 2, foo : foo}
            // The third "foo" will be highlighted, but the error is at the second "foo".
            // But to find this, we probably need a more advanded regular expression
            return;
        }
        // else
        
        if (this.raw === "Empty block.") {
            // This error occurs. when a block, e.g. an if-statement or for-loop body, is empty or just contains comments
            // The problem is, that the character index points to the next non-whitespace character after the closing bracket of the empty block.
            // Also, the evidence given in the error object points to the wrong line and the string saved in this.a is simply the next token after the closin bracket of the empty block
            // All not very helpful, nevertheless, it would be better to highlight the empty block itself
            // Even if we can't find a correct part of the code to highlight, at least the line should be correct
            // Let's try to find the correct line for the highlight (it should at least be in the empty block...)
            // Look at the evidence UP TO the given character index
            stringToTest = this.evidence.substring(0, this.startPosition.ch);
            match = whitespaceRegex.exec(stringToTest);
            // check whether there is only whitespace or nothing in front of this character in the current line
            while ((stringToTest.length === 0)
                    || ((match !== null) && (match[0].length === stringToTest.length))) {
                // only whitespace in front, we definitely need to go back one line to find the empty block
                this.startPosition.line -= 1;
                stringToTest = codeLines[this.startPosition.line];
                
                // now it might happen that we encountered an empty line (just whitespace) or a comment line
                // we want to jump over that as well, so we now use a different regex to test whether we should go back another line
                match = whitespaceWithOptionalCommentsRegex.exec(stringToTest);
                // so we do that until we find a line that does not match this regex, i.e. that contains some other token than whitespace and comments
            }
            // now: there is some non-whitespace character before the token found by the error, so this might actually be the correct line
            
            // at this point we might have changed a line back if the error line only contained whitespace before the error.
            // so we should now be at a line with a closing }
            // check the (possibly new) line to see whether there is any code but the closing }
            match = regexForLineWithOnlyClosingBlockBracketPossiblyFollowedByAComment.exec(stringToTest);
            if (match === null) {
                // Did not find a closing }. But there should usually be one.
                // We might have gone to far back. This can happen if the file ended after the closing bracket of the empty block.
                // In this case we already started on the line with the closing bracket and our previous code was wrong.
                // However, this is difficult to discover directly, therefore there was no check previously.
                // We now assume that's what happened and set back the starting position to the original one, hoping that the closing bracket is there
                this.startPosition = originalStartingPosition;
                stringToTest = stringToTest = this.evidence.substring(0, this.startPosition.ch);
                match = regexForLineWithOnlyClosingBlockBracketPossiblyFollowedByAComment.exec(stringToTest);
            }
            if ((stringToTest.length === 0) || (match !== null)) {
                // check whether it matched the complete line
                if ((stringToTest.length === 0) || (match[0].length === stringToTest.length)) {
                    // the line just contains something like "    }  "
                    // which means we haven't reached the empty block itself yet and have to go back another line
                    this.startPosition.line -= 1;
                    stringToTest = codeLines[this.startPosition.line];
                    // now this block should usually just contain whitespace and possibly comments
                    // we just highlight all the whitespace and the first two non-whitespace characters (since that would usually be the start of a comment)
                    match = whitespaceWithTwoOptionalOtherCharactersRegex.exec(stringToTest);
                    if (match !== null) {
                        this.startPosition.ch = match.index;
                        this.endPosition = {line: this.startPosition.line, ch: this.startPosition.ch + match[0].length};
                    } else {
                        // no clue why the regex wouldn't work, just highlight the complete line
                        this.startPosition.ch = 0;
                        this.endPosition = {line: this.startPosition.line, ch: stringToTest.length};
                    }
                } else {
                    // we found a closing }, but there were other tokens before it, this means we already found the correct line
                    // it also means there is not a single line comment before the closing bracket (since that would comment out the closing bracket)
                    // also, there shouldn't be other tokens before that, only a multiline comment perhaps
                    // try to find this whitespace+optional-comment string and highlight it
                    match = whitespaceWithOptionalCommentFollowedByAClosingBracketRegex.exec(stringToTest);
                    // now there could be more than one closing bracket in that string. We want to have the LAST one.
                    while (match !== null) {
                        previousMatch = match;
                        match = whitespaceWithOptionalCommentFollowedByAClosingBracketRegex.exec(stringToTest);
                    }
                    // now previousMatch should contain the last match of our regex
                    if (previousMatch !== undefined) {
                        if (previousMatch[0].length <= 1) {
                            // this means we did not find whitespace or comments before the closing bracket
                            // in that case we just highlight the character before the closing bracket (which should usually be the opening bracket)
                            // AND the closing bracket
                            this.startPosition.ch = previousMatch.index - 1; // -1 because we want the previous character
                            this.endPosition = {line: this.startPosition.line, ch: this.startPosition.ch + 2}; // highlight 2 characters
                        } else {
                            this.startPosition.ch = previousMatch.index;
                            this.endPosition = {line: this.startPosition.line, ch: this.startPosition.ch + (previousMatch[0].length - 1)}; // -1, since we don't want to highlight the closing bracket
                        }
                    } else {
                        // if we reach this, it would mean we didn't find a closing }, which is strange. Don't know what to do about it, use the default highlight
                        this.calculateSimpleStartAndEndPosition();
                    }
                }
            } else {
                // we did not find a closing }. No clue what that means and what to do now. Use the default highlight.
                this.calculateSimpleStartAndEndPosition();
            }
            return;
        }
        // else
        
        if (this.raw === "Empty case.") {
            // This error occurs. when a case in a switch statement is empty, i.e. does not contain any statements
            // Similar to the "Empty block" error the problem is, that the character index points to the next non-whitespace character after the 'case something:' 
            // Also, the evidence given in the error object points to the wrong line and the string saved in this.a is simply the next token after the closin bracket of the empty block
            // All not very helpful, nevertheless, it would be better to highlight the empty case itself
            // Even if we can't find a correct part of the code to highlight, at least the line should be correct
            // Let's try to find the correct line for the highlight (it should at least be in the empty block...)
            // Look at the evidence UP TO the given character index
            stringToTest = this.evidence.substring(0, this.startPosition.ch);
            match = whitespaceRegex.exec(stringToTest);
            // check whether there is only whitespace or nothing in front of this character in the current line
            while ((stringToTest.length === 0)
                    || ((match !== null) && (match[0].length === stringToTest.length))) {
                // only whitespace in front, we definitely need to go back one line to find the empty block
                this.startPosition.line -= 1;
                stringToTest = codeLines[this.startPosition.line];
                
                // now it might happen that we encountered an empty line (just whitespace) or a comment line
                // we want to jump over that as well, so we now use a different regex to test whether we should go back another line
                match = whitespaceWithOptionalCommentsRegex.exec(stringToTest);
                // so we do that until we find a line that does not match this regex, i.e. that contains some other token than whitespace and comments
            }
            // now: there is some non-whitespace character before the token found by the error, so this might actually be the correct line
            
            // at this point we might have changed a line back if the error line only contained whitespace before the error.
            // so we should now be at the line with the case:
            // look for it and highlight it
            match = regexForCaseAndArgument.exec(stringToTest);
            if (match !== null) {
                this.startPosition.ch = match.index;
                this.endPosition = {line: this.startPosition.line, ch: this.startPosition.ch + match[0].length};
            } else {
                // no clue why the regex wouldn't work, just highlight the complete line
                this.startPosition.ch = 0;
                this.endPosition = {line: this.startPosition.line, ch: stringToTest.length};
            }
            return;
        }
        // else
        
        if (this.raw === "Empty class.") {
            // Empty class hints at an empty character class in a regular expression, e.g. /[]/ or /abc[]*/
            // However, the error points to the character BEFORE the empty class (before the [) and this.a is undefined, so there is nothing to search for
            // We fix that now:
            this.calculateSimpleStartAndEndPosition("[]");
            // This is a kind of missing. Add an insertion marker instead of a highlight.
            this.type = JSLintError.TypesEnum.MISSING;
            // Currently our star and end position point to the the opening [ and after teh closing ].
            // We want to place the insertion marker between the brackets, so:
            this.startPosition.ch += 1;
            this.endPosition = this.startPosition;
            return;
        }
        // else
        
        if (this.raw === "Expected '{a}' and instead saw '{b}'.") {
            if (this.a === ";") {
                // the semicolon is a special case, because it is usally missing at the end of the line, and the token reported found instead is in the next line
                // So, this is a kind of missing. Add an insertion marker at the position reported(which is the the position where the semicolon should be)
                this.type = JSLintError.TypesEnum.MISSING;
                this.endPosition = this.startPosition;
            } else {
                // The problem here is that we look for this.a in the default highlight.
                // But in this case we have to look for this.b (what was actually found) and highlight it
                this.calculateSimpleStartAndEndPosition(this.b);
            }
            return;
        }
        // else
        
        if (this.raw === "Expected '{a}' at column {b}, not column {c}.") {
            // in this case we simply have to check which of the colum values is bigger and use them to highlight the correct characters
            if (this.b > this.c) {
                this.startPosition.ch = this.c - 1; // - 1 because the colums start at 1
                this.endPosition = {line: this.startPosition.line, ch: (this.b - 1)};
                // This is a kind of missing. Add an insertion marker at the wrong column (the start position)
                this.type = JSLintError.TypesEnum.MISSING;
            } else {
                this.startPosition.ch = this.b - 1;
                this.endPosition = {line: this.startPosition.line, ch: (this.c - 1)};
            }
            return;
        }
        // else
        
        if (this.raw === "The body of a for in should be wrapped in an if statement to filter unwanted properties from the prototype.") {
            // In this case the error points to the line of the for. However we would like to highlight the body of the for-loop
            // We just test whether this line contains an opening and a closing bracket, if so we assume that's the body and highlight it.
            // otherwise, we just highlight the line with the closing bracket, if it contains anything, or the line after the closing bracket
            stringToTest = this.evidence.substr(this.startPosition.ch);
            match = copmpleteLoopBodyOnThisLineRegex.exec(stringToTest);
            if (match !== null) {
                // it's on the same line
                // highlight the stuff between the {}
                // match[0] contains the complete string
                // match[1] the part before the body (up to and including the closing bracket)
                // match[2] the part to highlight
                this.startPosition.ch += match.index + match[1].length;
                this.endPosition = {line: this.startPosition.line, ch: this.startPosition.ch + match[2].length};
            } else {
                // not the complete body on this line
                // find the line with the opening {
                indexOfStringToSearchFor = stringToTest.indexOf("{");
                /*jslint vars: true */
                var changedLines = false;
                /*jslint vars: false */
                while ((indexOfStringToSearchFor === -1) && (stringToTest !== undefined)) {
                    this.startPosition.line += 1;
                    changedLines = true;
                    stringToTest = codeLines[this.startPosition.line];
                    if (stringToTest !== undefined) {
                        indexOfStringToSearchFor = stringToTest.indexOf("{");
                    }
                }
                if (stringToTest === undefined) {
                    // something went wrong, go back to the starting point and use the default highlight
                    this.startPosition = originalStartingPosition;
                    this.calculateSimpleStartAndEndPosition();
                    return;
                }
                // found a line with an opening {
                indexOfStringToSearchFor += 1; // exclude the opening { itself
                // check whether it contains code after the {
                stringToTest = stringToTest.substr(indexOfStringToSearchFor);
                match = optionalWhitespaceWithOptionalCommentsRegex.exec(stringToTest);
                if ((stringToTest.length === 0)
                        || ((match !== null) && (match[0].length === stringToTest.length))
                        ) {
                    // there is nothing but whitespace and comments on this line
                    // highlight the next line completely, if it exists
                    this.startPosition.line += 1;
                    stringToTest = codeLines[this.startPosition.line];
                    if (stringToTest === undefined) {
                        // something went wrong, go back to the starting point and use the default highlight
                        this.startPosition = originalStartingPosition;
                        this.calculateSimpleStartAndEndPosition();
                        return;
                    } else {
                        this.startPosition.ch = 0;
                        this.endPosition = {line: this.startPosition.line, ch : stringToTest.length};
                    }
                } else {
                    // there is code on the current line, simply highlight everything after the opening {
                    if (!changedLines) {
                        // add the indexOfStringToSearchFor
                        this.startPosition.ch += indexOfStringToSearchFor;
                    } else {
                        // use the indexOfStringToSearchFor
                        this.startPosition.ch = indexOfStringToSearchFor;
                    }
                    this.endPosition = {line: this.startPosition.line, ch: this.startPosition.ch + stringToTest.length};
                }
            }
            return;
        }
        // else
        
        if (this.raw === "The Function constructor is eval.") {
            // Function should not be called as a constructor. But the error points to the opening bracket of the constructor call.
            // Set it back correctly and ask it to highlight "Function" itself.
            this.startPosition.ch = 0;
            this.calculateSimpleStartAndEndPosition("Function");
            return;
        }
        // else
        
        if (this.raw === "Don't make functions within a loop.") {
            // This is another case where the error points to the next token AFTER the closing bracket of the body of the loop.
            // In this case we want to underline the corresponding "function" keyword, to indicate that there should be no function definition at that point
            // Sadly it's very difficult to find the correct function keyword to highlight. 
            // The following was an approach that only worked for simple cases but fails as soon as another function is declared inside the infringing function
            /*
                // Therefore, we just go backwards line-by-line until we find a "function" keyword and underline that
                stringToTest = this.evidence.substring(0, this.startPosition.ch); // it should be before this point
                var functionString = "function";
                indexOfStringToSearchFor = stringToTest.indexOf(functionString);
                while ((indexOfStringToSearchFor === -1) && (this.startPosition.line > 0)) {
                    this.startPosition.line -= 1;
                    stringToTest = codeToCompileLines[this.startPosition.line];
                    indexOfStringToSearchFor = stringToTest.indexOf(functionString);
                }
                if (indexOfStringToSearchFor > -1) {
                    this.startPosition.ch = indexOfStringToSearchFor;
                    this.endPosition = {line: this.startPosition.line, ch: this.startPosition.ch + functionString.length};
                } else {
                    // couldn't find a function keyword, go back to the start and use the default highlight
                    this.startPosition = originalStartingPosition;
                    this.calculateSimpleStartAndEndPosition();
                }
            */
            // Instead we just use the default highlight.
            this.calculateSimpleStartAndEndPosition();
            return;
        }
        // else
        
        if (this.raw === "Label '{a}' on '{b}' statement.") {
            // The problem here is a label on a non-loop statement, which shouldn't be used. 
            // The error points to the statement line, not the label. But the problem is usually the addition of the label, not the statement itself.
            // therefore, the label should be highlighted. We search backwards for the label, to highlight it.
            stringToTest = this.evidence.substring(0, this.startPosition.ch); // it should be before this point
            indexOfStringToSearchFor = stringToTest.indexOf(this.a);
            while ((indexOfStringToSearchFor === -1) && (this.startPosition.line > 0)) {
                this.startPosition.line -= 1;
                stringToTest = codeLines[this.startPosition.line];
                indexOfStringToSearchFor = stringToTest.indexOf(this.a);
            }
            if (indexOfStringToSearchFor > -1) {
                this.startPosition.ch = indexOfStringToSearchFor;
                this.endPosition = {line: this.startPosition.line, ch: this.startPosition.ch + this.a.length};
            } else {
                // couldn't find a function keyword, go back to the start and use the default highlight
                this.startPosition = originalStartingPosition;
                this.calculateSimpleStartAndEndPosition();
            }
            return;
        }
        // else
        
        if ((this.raw === "A leading decimal point can be confused with a dot: '.{a}'.")
                || (this.raw === "A trailing decimal point can be confused with a dot: '.{a}'.")) {
            // The error also points to the characters AFTER the decimal point, it would be better to highlight the decimal point itself
            if (this.raw === "A trailing decimal point can be confused with a dot: '.{a}'.") {
                // In this case it not only points to the characters after the decimal point as well, it ONLY points to those, not to the decimal point. Fix that:
                this.startPosition.ch -= 1;
                this.calculateSimpleStartAndEndPosition(".");
            } else {
                this.calculateSimpleStartAndEndPosition(".");
                // This is a kind of missing. Add an insertion marker before the ".".
                this.type = JSLintError.TypesEnum.MISSING;
            }
            
            return;
        }
        // else
        
        if ((this.raw === "Missing '{a}'.")
                || (this.raw === "Missing property name.")
                || (this.raw === "Missing 'use strict' statement.")
                || (this.raw === "Missing name in function statement.")) {
            // The error points to the character where the missing string should be inserted.
            // we simply display an insertion marker at that position
            this.type = JSLintError.TypesEnum.MISSING;
            this.endPosition = this.startPosition;
            return;
        }
        // else
        
        if (this.raw === "Missing '{a}' after '{b}'.") {
            // The only case for which I found that was "Missing 'break' after 'case'."
            // We will handle that and use the default highlight otherwise
            if ((this.a === "break") && (this.b === "case")) {
                // In this case the error points to the NEXT case (or default) after the one with the missing break
                // so we just go back one line (assuming that there was at least a line break before the next case/default)
                // and add an insertion marker at the end of the line
                this.type = JSLintError.TypesEnum.MISSING;
                this.startPosition.line -= 1;
                this.startPosition.ch = codeLines[this.startPosition.line].length;
                this.endPosition = this.startPosition;
            } else {
                // no real clue what to do, but we should most likely search for this.b
                this.calculateSimpleStartAndEndPosition(this.b);
                // And add an insertion marker in the beginning, since we don't even know what to test for
                this.type = JSLintError.TypesEnum.MISSING;
            }
            return;
        }
        // else
        
        if (this.raw === "A regular expression literal can be confused with '/='.") {
            // The error points to the character AFTER the "/=", so we simply highlight the two characters before that
            this.startPosition.ch -= 2;
            this.endPosition = originalStartingPosition;
            return;
        }
        // else
        
        if (this.raw === "Line too long.") {
            // Error points to last character in the line. Just highlight the complete line
            this.startPosition.ch = 0;
            this.endPosition = {line: this.startPosition.line, ch : this.evidence.length};
            return;
        }
        // else
        
        if ((this.raw === "Unclosed string.")
                || (this.raw === "Unclosed comment.")
                || (this.raw === "Unclosed regular expression.")) {
            // Just highlight the rest of the line, after the unclosed string started
            this.endPosition = {line: this.startPosition.line, ch : this.evidence.length};
            
            // This is a kind of missing. Add an insertion marker at the end of the line
            this.type = JSLintError.TypesEnum.MISSING;
            this.insertionMarkerPosition = this.endPosition; // by default this.startPosition will be used, so we have to set this
            return;
        }
        // else
        
        if (this.raw === "It is not necessary to initialize '{a}' to 'undefined'.") {
            // Error points to the "=" sign of the initialization, this.a contains the variable name
            // Try to find the complete initialization: variableName = undefined;
            stringToTest = this.evidence;
            stringA = String(this.a);
            undefinedInitializationRegex = new RegExp(_regExpEscape(stringA) + "(\\s*=\\s*undefined)", "g");
            match = undefinedInitializationRegex.exec(stringToTest);
            while ((match !== null) && (this.startPosition.ch > match.index + match[0].length)) {
                previousMatch = match;
                match = undefinedInitializationRegex.exec(stringToTest);
            }
            if (match === null) { match = previousMatch; }
            if (match !== undefined) {
                this.startPosition.ch = match.index + stringA.length; // Highlight everything after the varname (the equals sign and the undefined)
                this.endPosition = {line: this.startPosition.line, ch: this.startPosition.ch + match[1].length}; // match[1] should contain the equals sign and the "undefined", because we set the brackets in the regex accordingly
            } else {
                this.calculateSimpleStartAndEndPosition();
            }
            return;
        }
        // else
        
        if (this.raw === "Use the array literal notation [].") {
            // Error points to the opening bracket of "Array("
            // Kinda okay, but it would be better to highlight the "Array" part as well
            stringToTest = this.evidence;
            indexOfStringToSearchFor = stringToTest.indexOf("Array");
            this.startPosition.ch = indexOfStringToSearchFor;
            this.endPosition = {line: this.startPosition.line, ch : originalStartingPosition.ch};
            return;
        }
        // else
        
        if (this.raw === "Spaces are hard to count. Use {{a}}.") {
            // Error points to the last space in the group. Find the first one to highlight all of them
            stringToTest = this.evidence;
            while ((this.startPosition.ch >= 0) && (stringToTest.charAt(this.startPosition.ch) === " ")) {
                this.startPosition.ch -= 1;
            }
            // one character before the first space
            // add 2, because we want to keep the first space
            this.startPosition.ch += 2;
            this.endPosition = {line: this.startPosition.line, ch: originalStartingPosition.ch + 1};
            return;
        }
        // else
        
        if (this.raw === "Wrap an immediate function invocation in parentheses to assist the reader in understanding that the expression is the result of a function, and not the function itself.") {
            // Error points to the first argument of the invocation or the closing ) if there are no arguments.
            // instead it should point to the opening (
            stringToTest = this.evidence.substring(0, this.startPosition.ch);
            indexOfStringToSearchFor = stringToTest.lastIndexOf("(");
            if (indexOfStringToSearchFor > -1) {
                this.startPosition.ch = indexOfStringToSearchFor;
                this.endPosition = {line: this.startPosition.line, ch: this.startPosition.ch + 1};
            } else {
                // did not find it, just reset and use the default highlight
                this.startPosition = originalStartingPosition;
                this.calculateSimpleStartAndEndPosition();
            }
            return;
        }
        // else
        
        if (this.raw === "document.write can be a form of eval.") {
            // error points just to "document", would be nice to highlight "document.write"
            stringToTest = this.evidence.substr(this.startPosition.ch);
            stringToSearchFor = "document.write";
            indexOfStringToSearchFor = stringToTest.lastIndexOf(stringToSearchFor);
            if (indexOfStringToSearchFor > -1) {
                this.startPosition.ch += indexOfStringToSearchFor;
                this.endPosition = {line: this.startPosition.line, ch: this.startPosition.ch + stringToSearchFor.length};
            } else {
                // did not find it, just reset and use the default highlight
                this.startPosition = originalStartingPosition;
                this.calculateSimpleStartAndEndPosition();
            }
            return;
        }
        // else
        
        // for the following errors I know that the default highlighting works correctly
        if ((this.raw === "'{a}' was used before it was defined.")
                || (this.raw === "'{a}' is a statement label.")
                || (this.raw === "'{a}' is already defined.")
                || (this.raw === "The '&&' subexpression should be wrapped in parens.")
                || (this.raw === "Do not assign to the exception parameter.")
                || (this.raw === "Avoid '{a}'.")
                || (this.raw === "Bad assignment.")
                || (this.raw === "Bad for in variable '{a}'.")
                || (this.raw === "Bad invocation.") // I don't like the default highlight, but it's too complicated to make it better
                || (this.raw === "Strict violation.")
                || (this.raw === "Combine this with the previous 'var' statement.")
                || (this.raw === "Expected a conditional expression and instead saw an assignment.")
                || (this.raw === "Confusing use of '{a}'.")
                || (this.raw === "A constructor name '{a}' should start with an uppercase letter.")
                || (this.raw === "eval is evil.")
                || (this.raw === "Function statements should not be placed in blocks. Use a function expression or move the statement to the top of the outer function.")
                || (this.raw === "Function statements are not invocable. Wrap the whole function invocation in parens.")
                || (this.raw === "Use the function form of 'use strict'.")
                || (this.raw === "Implied eval is evil. Pass a function instead of a string.")
                || (this.raw === "Unexpected 'in'. Compare with undefined, or use the hasOwnProperty method instead.")
                || (this.raw === "Insecure '{a}'.")
                || (this.raw === "Use the isNaN function to compare with NaN.")
                || (this.raw === "Move the invocation into the parens that contain the function.")
                || (this.raw === "Move 'var' declarations to the top of the function.")
                || (this.raw === "Nested comment.")
                || (this.raw === "Do not use {a} as a constructor.")
                || (this.raw === "Mixed spaces and tabs.")
                || (this.raw === "'{a}' is not a label.")
                || (this.raw === "Missing radix parameter.") // too difficult, to make the highlight better
                || (this.raw === "Read only.")
                || (this.raw === "Reserved name '{a}'.")
                || (this.raw === "['{a}'] is better written in dot notation.")
                || (this.raw === "Unescaped '{a}'.")
                || (this.raw === "Unexpected /*property*/ '{a}'.")
                || (this.raw === "Unnecessary 'use strict'.")
                || (this.raw === "Unreachable '{a}' after '{b}'.") // good enough
                || (this.raw === "Use the object literal notation {}.")
                || (this.raw === "Use the || operator.")
                || (this.raw === "Variable {a} was not declared correctly.")
                || (this.raw === "Weird assignment.")
                || (this.raw === "Weird condition.")
                || (this.raw === "Weird relation.")
                || (this.raw === "Weird construction. Delete 'new'.")
                || (this.raw === "Weird ternary.")
                || (this.raw === "Wrap the /regexp/ literal in parens to disambiguate the slash operator.")
                ) {
            this.calculateSimpleStartAndEndPosition();
            return;
        }
        // else
        
        // adsafe
        if (this.raw.search(/adsafe/i) === 0) {
            // don't know what to do about adsafe errors, just try the simple highlight
            this.calculateSimpleStartAndEndPosition();
            return;
        }
        // else
        
        // some errors I could not reproduce to test them
        if ((this.raw === "'{a}' is not allowed.") // does not seem to be used in the current implementation
                || (this.raw === "'{a}' is not defined.") // does not seem to be used in the current implementation
                || (this.raw === "'{a}' used out of scope.") // Could not reproduce this error to test it
                || (this.raw === "Attribute '{a}' not all lower case.") // Could not reproduce this error to test it
                || (this.raw === "Bad constructor.") // Could not reproduce this error to test it
                || (this.raw === "Bad name: '{a}'.") // Could not reproduce this error to test it
                || (this.raw === "Bad number '{a}'.") // Could not reproduce this error to test it
                || (this.raw === "Bad operand.") // Could not reproduce this error to test it
                || (this.raw === "Unexpected control character '{a}'.") // Not sure what that means
                || (this.raw === "Dangerous comment.") // Not sure what that means
                || (this.raw === "Expected '{a}'.") // Could not reproduce (only got stuff like "Expected '{a}' and instead saw '{b}'."
                || (this.raw === "Expected an identifier in an assignment and instead saw a function invocation.") // Could not reproduce
                || (this.raw === "Missing option value.") // does not seem to be used in the current implementation
                || (this.raw === "Missing url.") // Could not reproduce
                || (this.raw === "Nested not.") // Could not reproduce
                || (this.raw === "'{a}' has not been fully defined yet.") // Could not reproduce
                || (this.raw === "'{a}' is not a function.") // Could not reproduce
                || (this.raw === "'{a}' is out of scope.") // Could not reproduce
                || (this.raw === "'{a}' should not be greater than '{b}'.") // Could not reproduce
                || (this.raw === "Redefinition of '{a}'.") // does not seem to be used in the current implementation
                || (this.raw === "Unexpected character '{a}' in {b}.") // Could not reproduce
                || (this.raw === "Unsafe character.") // Could not reproduce
                || (this.raw === "JavaScript URL.") // Could not reproduce
                || (this.raw === "Use the charAt method.") // does not seem to be used in the current implementation
                || (this.raw === "Weird program.") // Could not reproduce
                ) {
            this.calculateSimpleStartAndEndPosition();
            return;
        }
        // else 
        

        // default: simple highlight
        this.calculateSimpleStartAndEndPosition();
        
        // other errors that are not specifically handled
        //  Bad hex color '{a}'.
        //  Bad entity.
        //  Bad HTML string.
        //  Bad id: '{a}'.
        //  A css file should begin with @charset 'UTF-8';
        //  Empty class.
        //  This is an ES5 feature.
        //  HTML confusion in regular expression '<{a}'.
        //  Avoid HTML event handlers.
        //  lang is deprecated.
        //  Unexpected parameter '{a}' in get {b} function.
        //  Expected parameter (value) in set {a} function.
        //  {a} ({b}% scanned).
        //  Stopping.                       // Does not seem to appear by itself, only in combination with {a} ({b}% scanned).
        //  A '<{a}>' must be within '<{b}>'.
        //  Too many errors.                // Does not seem to appear by itself, only in combination with {a} ({b}% scanned).
        //  type is unnecessary.
        //  Unexpected comment.
        //  Unrecognized style attribute '{a}'.
        //  Unrecognized tag '<{a}>'.
        
        console.log(this);
    };
    
    return JSLintError;
});