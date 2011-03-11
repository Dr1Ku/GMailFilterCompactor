// Author: Cosmin Pitu <pitu.cosmin@gmail.com>, http://bit.ly/dr1ku
//				 ('Use at your own risk. Please do not use it for evil. Feedback is welcome. Thank you.' [http://www.json.org/java/])
//
// License: Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
//          (http://creativecommons.org/licenses/by-nc-sa/3.0/)
//
// Purpose: Compacts many filters which apply a given label into
// 					multi-part (if there are 100+ filters to compact, for instance)
// 					filters or a single, consolidated/compacted filter. Prompts
// 					input for the label's name, works as a bookmarklet as well.
//
// Usage: Open the 'Filters' Settings Tab within GMail and run.
//
// References: 
//	 [Groups09]: http://groups.google.com/group/gmail-labs-help-filter-import-export/browse_thread/thread/d2c3328fc5eb06ce


// Prepare jQuery container
var jQuerySrc = document.createElement('script'); 

// Set attributes for the jQuery <script>
jQuerySrc.setAttribute('type', 'text/javascript');
jQuerySrc.setAttribute('src', 'http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js'); 
jQuerySrc.setAttribute('onload', 'GMailFilterCompactorGo();'); 

// Append the jQuery <script> to <head>
var head = document.getElementsByTagName('head')[0];
head.appendChild(jQuerySrc);

// Callback to start executing the script after jQuery has loaded
function GMailFilterCompactorGo()
{
	var GMailFilterCompactor =
	{  
		// Parametrized constructor, initializes
		// constants and fields.
		initialize: function(pLabel, pWithDelete)
		{
			// jQuery Selectors for the filter edit panel (iFrame),
			// as well as an individual filter-level selector.
			// If the layout changes, these selectors should be
			// adjusted.
			this.SELECTOR_FILTER_IFRAME = 'iframe#canvas_frame';
			this.SELECTOR_FILTER = 'span.qW';
		
			// Filter searches shouldn't be longer than
			// 1500 chars [Groups09], keeping it at 512
			// for good measure. 
			this.SIZE_THRESHOLD = 512;
			
			// The action is prefixed with this string.
			this.ACTION_MSG = 'Do this: ';
			
			// The found filters can be deleted afterwards,
			// in order to create a bigger filter from the
			// output matcher chunks.
			this.mDeleteMatchedFilters = pWithDelete;
			
			// The label to be matched is stored within
			// a member variable (field) for easy fetching.
			this.mLabelName = pLabel;
			
			// The prefix for a 'Label as' action is this string
			this.mLabelAsAction = 'Apply label "' + this.mLabelName + '"';
			
			// The matchers (e.g. from:a@a.com) are stored within
			// these buffers, one for the current batch, one for
			// all 512 batches (chunks).
			this.matchersArray = [];
			this.matcherBuffer = '';
			
			// Storing current filter (will store the DOM
			// Element, matcher, action and checkbox) within
			// a field.
			this.mCurrentFilter = {};
		},
		
		// Updates the matcher, action and checkbox
		// for the current filter.
		updateCurrentFilter: function()
		{
			var me = this;
			
			// Get current filter
			var currentFilter = me.mCurrentFilter;
			
			// Prepare filter helpers
			var actionElem = jQuery(currentFilter.element);
			var actionElemParent = actionElem.parent();
			var actionStr = actionElemParent.html();
			
			// The matcher resides within the action element, some <wbr> tags have to be cleaned
			currentFilter.matcher = actionElem.html().replace(/<wbr>/gi, '');
			
			// The action needs to be parsed from a 'Do this: Apply label .. 
			// .. Never mark it as important, Never send to spam' etc. String
			currentFilter.action = actionStr.substring(actionStr.indexOf(me.ACTION_MSG) + me.ACTION_MSG.length, actionStr.length);
			
			// The checkbox is used for exporting or deleting multiple filters
			currentFilter.checkbox = actionElemParent.prev().children().first();
		},
		
		// Utility function which pushes the current buffer within the 
		// matchers array and finally rewinds (resets) the current buffer.
		rewindBuffer: function()
		{
			var me = this;
		
			// Truncate the last OR ('|') character from the buffer
			me.matcherBuffer = me.clean(me.matcherBuffer.substring(0, me.matcherBuffer.length - 1));
			
			// Push within the array and rewind (reset) the buffer;
			me.matchersArray.push("{" + me.matcherBuffer + "}");
			me.matcherBuffer = '';		
		},
		
		// Utility function, replaces "list:"-specific "&lt;" [<] and "&gt;" [>] artifacts,
		// as well as a "from:" artifact (in the end, a from: is automatically added by GMail).
		// Another improvement for the case in which it's a multi-pass (e.g. compact twice) is
		// the removal of extra noise within the string, respectively "{(" and ")}"
		clean: function(pString)
		{
			return pString.replace('&lt;', '<').replace('&gt;', '>')
										.replace('from:', '')
										.replace('{(', '').replace(')}', '');
		},
		
		// Checks if the current filter has a 'Label as <Label Name>' action
		// attached to it. If so, appends it to the buffer.
		checkCurrentFilterAction: function()
		{
			var me = this;
			
			// Get current filter
			var currentFilter = me.mCurrentFilter;
			
			// Build a RegularExpression object for a 'Label as <Label Name>' action
			var regExp = new RegExp(me.mLabelAsAction, 'i');
			
			// Check if the current Filter's action is a 'Label as <>' action
			if (currentFilter.action.match(regExp))
			{
				// If the buffer exceeds the given threshold, push the
				// buffer within the array
				if (me.matcherBuffer.length > me.SIZE_THRESHOLD)
				{
					me.rewindBuffer();
				}

				// Append the current filter's matcher to the matcher buffer
				me.matcherBuffer += me.clean(currentFilter.matcher) + '|';
				
				// Check the current filter's checkbox, if the results are to be deleted
				if (me.mDeleteMatchedFilters)
				{
					currentFilter.checkbox.click();
				}
			}	
		},
		
		// Outputs the results (all matcher chunks) as a 
		// popup or as a Firebug log message (if available).
		outputResults: function()
		{
			var me = this;
			
			// Of course, the matchers Array is empty if
			// a small sample of filters (under the threshold)
			// has been matched. The same can happen if the 
			// last chunk was under the threshold as well.
			me.rewindBuffer();
			
			// Determine if Firebug is activated or not
			var hasFirebug = (window && window.console);
			
			// Display intro message if no Firebug is available
			if (!hasFirebug)
			{
				alert
				(
					'Here come the results, don\'t forget ' +
					'to Select (CTRL+A), Copy (CTRL+C) and Paste (CTRL+V) them ' +
					'within a text editor for instance !'
				);
			}
			
			// Iterate through all matcher chunks
			jQuery.each
			(
				me.matchersArray, 
				function(idx, elem)
				{
					// If Firebug is activated, output the 
					// current chunk within the console.
					if (hasFirebug)
					{
						console.log(elem);
						console.log(' \n');
					}
					else
					{
						// Else, output the current chunk as a popup.
						alert(elem);
					}
				}
			);	

			// Inform the user that the task has finished
			hasFirebug ? alert('Done, check out the Firebug Console !') : alert('Those were the results, enjoy !');
		},
		
		// Deletes the matched filters, if the flag is set.
		// GMail of course includes a confirmation beforehand.
		eventuallyDeleteFoundFilters: function()
		{
			var me = this;
			
			// Only click the 'Delete' Button if the flag
			// is set. GMail asks for a confirmation anyway.
			if (me.mDeleteMatchedFilters)
			{
				me.frameBody.find('button.qR').filter('[innerHTML=\'Delete\']').click();
			}
		},
		
		// Main function, iterates over all current filters,
		// being interested only in those filters which have 
		// a 'Label as <Given Label>' action. Optinally deletes 
		// those filters and outputs the compacted matchers as an
		// alert or within Firebug's console.
		go: function()
		{
			var me = this;
			
			// Get the filter edit panel (iFrame)
			me.frameBody = jQuery(me.SELECTOR_FILTER_IFRAME).contents();
			
			// Get a list of all currently available filters.
			var filters = me.frameBody.find(me.SELECTOR_FILTER);
			
			// Iterate over all available filters, store the
			// filter's matcher and check the checkbox, if 
			// the matcher is a 'Label as <Given Label>' filter.
			jQuery.each
			(
				filters,           
				function(idx, elem)          
				{               
					// Update current filter
					me.mCurrentFilter.element = jQuery(elem);
				
					// Get matcher, action and checkbox for the current filter
					me.updateCurrentFilter();
					
					// Check if the current filter's action is a match
					me.checkCurrentFilterAction();
				}
			);

			// Output the resulting matchers as an alert
			// and as a Firebug console log as well (if
			// available)
			me.outputResults();
			
			// Eventually delete the matched filters
			me.eventuallyDeleteFoundFilters();
			
			// Firebug outputs the last result onto the console,
			// which isn't necessarily useful, therefore a 'dud'
			// (no effect) jQuery call is used to keep the console
			// output clean.
			jQuery('done');
		}
	};	
	
	// Get user input on the label's name
	var labelName = prompt
	(
		'What is the name of the Label we\'re looking for ? \n' +
		'For instance : \'Newsletter\' \n\n' +
		'Press Cancel to abort, no hard feelings.',
		
		'Newsletter'
	);
	
	if ( (labelName != null) && (labelName != '') )
	{
		// Get user input on deleting the filters afterwards.
		var withDelete = confirm
		(
			'Would you like to delete the found filters afterwards ?\n' +
			'You can create new \'compacted\' filters using this script\'s output.\n\n' +
			'    NOTE: \'Cancel\' is \'No, do not delete filters\' '
		);
		
		// Initialize the Compactor with the input and commence the process
		GMailFilterCompactor.initialize(labelName, withDelete);
		GMailFilterCompactor.go();
	}
}

// Cleanup
head.removeChild(jQuerySrc);