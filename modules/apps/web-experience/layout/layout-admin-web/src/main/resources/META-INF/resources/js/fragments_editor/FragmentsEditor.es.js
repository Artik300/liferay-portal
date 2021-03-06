import 'frontend-taglib/contextual_sidebar/ContextualSidebar.es';
import Component from 'metal-component';
import Soy from 'metal-soy';
import {Config} from 'metal-state';

import './dialogs/SelectMappingTypeDialog.es';
import './sidebar/SidebarAddedFragments.es';
import './sidebar/SidebarAvailableFragments.es';
import './sidebar/SidebarMapping.es';
import FragmentEntryLink from './FragmentEntryLink.es';
import templates from './FragmentsEditor.soy';

/**
 * Tab that will show fragmentEntryLinks added to the editor
 * @review
 * @type {!{
 *   id: !string,
 *   label: !string
 * }}
 */

const ADDED_FRAGMENTS_TAB = {
	id: 'added',
	label: Liferay.Language.get('added')
};

/**
 * FragmentsEditor
 * @review
 */

class FragmentsEditor extends Component {

	/**
	 * @inheritDoc
	 * @review
	 */

	created() {
		this._sidebarTabs = this.fragmentEntryLinks.length > 0 ?
			[...this.sidebarTabs, ADDED_FRAGMENTS_TAB] :
			[...this.sidebarTabs];
	}

	/**
	 * Sends message to delete a single fragment entry link to the server and,
	 * if success, sets the _dirty property to false.
	 * @param {!string} fragmentEntryLinkId
	 * @private
	 * @review
	 */

	_deleteFragmentEntryLink(fragmentEntryLinkId) {
		if (!this._dirty) {
			this._dirty = true;

			const formData = new FormData();

			formData.append(
				`${this.portletNamespace}fragmentEntryLinkId`,
				fragmentEntryLinkId
			);

			fetch(
				this.deleteFragmentEntryLinkURL,
				{
					body: formData,
					credentials: 'include',
					method: 'POST'
				}
			).then(
				() => {
					this._lastSaveDate = new Date().toLocaleTimeString();

					this._dirty = false;
				}
			);
		}
	}

	/**
	 * Fetches a FragmentEntryLink content from the fragment ID and
	 * fragmentEntryLink ID, returns a promise that resolves into it's content.
	 * @param {!string} fragmentEntryLinkId
	 * @return {Promise<string>}
	 * @review
	 */

	_fetchFragmentContent(fragmentEntryLinkId) {
		const formData = new FormData();

		formData.append(
			`${this.portletNamespace}fragmentEntryLinkId`,
			fragmentEntryLinkId
		);

		return fetch(
			this.renderFragmentEntryURL,
			{
				body: formData,
				credentials: 'include',
				method: 'POST'
			}
		).then(
			response => response.json()
		).then(
			response => response.content
		);
	}

	/**
	 * Focus a fragmentEntryLink for a given ID
	 * @param {string} fragmentEntryLinkId
	 * @review
	 */

	_focusFragmentEntryLink(fragmentEntryLinkId) {
		requestAnimationFrame(
			() => {
				const index = this.fragmentEntryLinks.findIndex(
					_fragmentEntryLink => {
						return _fragmentEntryLink.fragmentEntryLinkId === fragmentEntryLinkId;
					}
				);

				const fragmentEntryLinkElement = this.refs.fragmentEntryLinks.querySelectorAll(
					'.fragment-entry-link-wrapper'
				)[index];

				fragmentEntryLinkElement.focus();
				fragmentEntryLinkElement.scrollIntoView();
			}
		);
	}

	/**
	 * Gets a new FragmentEntryLink position.
	 * @returns {number}
	 * @private
	 * @review
	 */

	_getNewFragmentEntryLinkPosition() {
		const position = Math.max(
			0,
			...this.fragmentEntryLinks.map(
				fragmentEntryLink => fragmentEntryLink.position
			)
		);

		return position + 1;
	}

	/**
	 * Callback executed everytime an editable field has been changed
	 * @param {{
	 *   editableId: !string,
	 *   fragmentEntryLinkId: !string,
	 *   value: !string
	 * }} data
	 * @private
	 * @review
	 */

	_handleEditableChanged(data) {
		const fragmentEntryLink = this.fragmentEntryLinks.find(
			fragmentEntryLink => fragmentEntryLink.fragmentEntryLinkId === data.fragmentEntryLinkId
		);

		if (fragmentEntryLink) {
			fragmentEntryLink.editableValues[data.editableId] = data.value;
		}

		this._updateFragmentEntryLink(fragmentEntryLink);
	}

	/**
	 * Callback executed when a fragment entry of a collection is clicked.
	 * It receives fragmentEntryId and fragmentName as event data.
	 * @param {!Event} event
	 * @private
	 * @review
	 */

	_handleFragmentCollectionEntryClick(event) {
		if (!this._dirty) {
			this._dirty = true;

			const formData = new FormData();
			const position = this._getNewFragmentEntryLinkPosition();

			formData.append(
				`${this.portletNamespace}fragmentId`,
				event.fragmentEntryId
			);

			formData.append(
				`${this.portletNamespace}classNameId`,
				this.classNameId
			);

			formData.append(
				`${this.portletNamespace}classPK`,
				this.classPK
			);

			formData.append(
				`${this.portletNamespace}position`,
				position
			);

			fetch(
				this.addFragmentEntryLinkURL,
				{
					body: formData,
					credentials: 'include',
					method: 'POST'
				}
			).then(
				response => {
					return response.json();
				}
			).then(
				response => {
					if (!response.fragmentEntryLinkId) {
						throw new Error();
					}

					this.fragmentEntryLinks = [
						...this.fragmentEntryLinks,
						{
							config: {},
							content: '',
							editableValues: {},
							fragmentEntryId: event.fragmentEntryId,
							fragmentEntryLinkId: response.fragmentEntryLinkId,
							name: event.fragmentName,
							position
						}
					];

					this._focusFragmentEntryLink(
						response.fragmentEntryLinkId
					);

					return this._fetchFragmentContent(
						response.fragmentEntryLinkId
					).then(
						content => {
							const index = this.fragmentEntryLinks.findIndex(
								_fragmentEntryLink => {
									return _fragmentEntryLink.fragmentEntryLinkId === response.fragmentEntryLinkId;
								}
							);

							if (index !== -1) {
								this.fragmentEntryLinks[index].content = content;
							}
						}
					).then(
						() => {
							this._lastSaveDate = new Date().toLocaleTimeString();

							this._dirty = false;

							this._sidebarTabs = [
								...this.sidebarTabs,
								ADDED_FRAGMENTS_TAB
							];

							this._focusFragmentEntryLink(
								response.fragmentEntryLinkId
							);
						}
					);
				}
			);
		}
	}

	/**
	 * Moves a fragment one position onto the specified direction.
	 * @param {!{
	 *   direction: !number,
	 *   fragmentEntryLinkId: !string
	 * }} data
	 * @private
	 * @review
	 */

	_handleFragmentMove(data) {
		const direction = data.direction;
		const index = this.fragmentEntryLinks.findIndex(
			fragmentEntryLink => fragmentEntryLink.fragmentEntryLinkId === data.fragmentEntryLinkId
		);

		if (
			(direction === FragmentEntryLink.MOVE_DIRECTIONS.DOWN && index < this.fragmentEntryLinks.length - 1) ||
			(direction === FragmentEntryLink.MOVE_DIRECTIONS.UP && index > 0)
		) {
			const formData = new FormData();

			formData.append(
				`${this.portletNamespace}fragmentEntryLinkId1`,
				this.fragmentEntryLinks[index].fragmentEntryLinkId
			);

			formData.append(
				`${this.portletNamespace}fragmentEntryLinkId2`,
				this.fragmentEntryLinks[index + direction].fragmentEntryLinkId
			);

			fetch(
				this.updateFragmentEntryLinksURL,
				{
					body: formData,
					credentials: 'include',
					method: 'POST'
				}
			).then(
				() => {
					this._lastSaveDate = new Date().toLocaleTimeString();

					this._dirty = false;
				}
			);

			this.fragmentEntryLinks = this._swapListElements(
				Array.prototype.slice.call(this.fragmentEntryLinks),
				index,
				index + direction
			);
		}
	}

	/**
	 * Removes a fragment from the fragment list. The fragment to
	 * be removed should be specified inside the event as fragmentEntryLinkId
	 * @param {!{
	 *   fragmentEntryLinkId: !string
	 * }} data
	 * @private
	 * @review
	 */

	_handleFragmentRemove(data) {
		const index = this.fragmentEntryLinks.findIndex(
			fragmentEntryLink => fragmentEntryLink.fragmentEntryLinkId === data.fragmentEntryLinkId
		);

		if (index !== -1) {
			this.fragmentEntryLinks = [
				...this.fragmentEntryLinks.slice(0, index),
				...this.fragmentEntryLinks.slice(index + 1)
			];

			if (this.fragmentEntryLinks.length === 0) {
				this._sidebarSelectedTab = FragmentsEditor.DEFAULT_TAB_ID;
				this._sidebarTabs = [...this.sidebarTabs];
			}

			this._deleteFragmentEntryLink(data.fragmentEntryLinkId);
		}
	}

	/**
	 * Callback executed when the sidebar should be hidden
	 * @private
	 * @review
	 */

	_handleHideContextualSidebar() {
		this._contextualSidebarVisible = false;
	}

	/**
	 * Callback executed when a mapping type hsa been selected
	 * @param {{ labels: Array<string> }} event
	 * @private
	 * @review
	 */

	_handleMappingTypeSelected(event) {
		this.selectedMappingTypeLabel = event.label;
	}

	/**
	 * Callback executed when the SelectMappingTypeDialog should be shown
	 * @review
	 */

	_handleSelectAssetTypeButtonClick() {
		this._selectMappingTypeDialogVisible = true;
	}

	/**
	 * Callback executed when the SelectMappingTypeDialog visibility changes
	 * @param {{ newVal: boolean }} change
	 * @private
	 * @review
	 */

	_handleSelectMappingTypeDialogVisibleChanged(change) {
		this._selectMappingTypeDialogVisible = change.newVal;
	}

	/**
	 * Updates _sidebarSelectedTab according to the clicked element
	 * @param {!Event} event
	 * @private
	 * @review
	 */

	_handleSidebarTabClick(event) {
		this._sidebarSelectedTab = event.delegateTarget.dataset.tabName;
	}

	/**
	 * Callback executed when the sidebar visible state should be toggled
	 * @private
	 * @review
	 */

	_handleToggleContextualSidebarButtonClick() {
		this._contextualSidebarVisible = !this._contextualSidebarVisible;
	}

	/**
	 * Swap the positions of two fragmentEntryLinks
	 * @param {Array} list
	 * @param {number} indexA
	 * @param {number} indexB
	 * @private
	 */

	_swapListElements(list, indexA, indexB) {
		[list[indexA], list[indexB]] = [list[indexB], list[indexA]];

		return list;
	}

	/**
	 * Sends the change of a single fragment entry link to the server and, if
	 * success, sets the _dirty property to false.
	 * @private
	 * @review
	 */

	_updateFragmentEntryLink(fragmentEntryLink) {
		if (!this._dirty) {
			this._dirty = true;

			const formData = new FormData();

			formData.append(
				`${this.portletNamespace}fragmentEntryLinkId`,
				fragmentEntryLink.fragmentEntryLinkId
			);

			formData.append(
				`${this.portletNamespace}editableValues`,
				JSON.stringify(fragmentEntryLink.editableValues)
			);

			fetch(
				this.editFragmentEntryLinkURL,
				{
					body: formData,
					credentials: 'include',
					method: 'POST'
				}
			).then(
				() => {
					this._lastSaveDate = new Date().toLocaleTimeString();

					this._dirty = false;
				}
			);
		}
	}
}

/**
 * Default selected tab
 * @review
 * @static
 * @type {!string}
 */

FragmentsEditor.DEFAULT_TAB_ID = 'available';

/**
 * State definition.
 * @review
 * @static
 * @type {!Object}
 */

FragmentsEditor.STATE = {

	/**
	 * URL for associating fragment entries to the underlying model.
	 * @default undefined
	 * @instance
	 * @memberOf FragmentsEditor
	 * @review
	 * @type {!string}
	 */

	addFragmentEntryLinkURL: Config.string().required(),

	/**
	 * Class name id used for storing changes.
	 * @default undefined
	 * @instance
	 * @memberOf FragmentsEditor
	 * @review
	 * @type {!string}
	 */

	classNameId: Config.string().required(),

	/**
	 * Class primary key used for storing changes.
	 * @default undefined
	 * @instance
	 * @memberOf FragmentsEditor
	 * @review
	 * @type {!string}
	 */

	classPK: Config.string().required(),

	/**
	 * Default configuration for AlloyEditor instances.
	 * @default {}
	 * @instance
	 * @memberOf FragmentsEditor
	 * @review
	 * @type {object}
	 */

	defaultEditorConfiguration: Config.object().value({}),

	/**
	 * URL for removing fragment entries of the underlying model.
	 * @default undefined
	 * @instance
	 * @memberOf FragmentsEditor
	 * @review
	 * @type {!string}
	 */

	deleteFragmentEntryLinkURL: Config.string().required(),

	/**
	 * URL for updating a distinct fragment entries of the editor.
	 * @default undefined
	 * @instance
	 * @memberOf FragmentsEditor
	 * @review
	 * @type {!string}
	 */

	editFragmentEntryLinkURL: Config.string().required(),

	/**
	 * Available entries that can be used, organized by collections.
	 * @default undefined
	 * @instance
	 * @memberOf FragmentsEditor
	 * @review
	 * @type {!Array<object>}
	 */

	fragmentCollections: Config.arrayOf(
		Config.shapeOf(
			{
				entries: Config.arrayOf(
					Config.shapeOf(
						{
							fragmentEntryId: Config.string().required(),
							name: Config.string().required()
						}
					)
				).required(),
				fragmentCollectionId: Config.string().required(),
				name: Config.string().required()
			}
		)
	).required(),

	/**
	 * URL for obtaining the class types of an asset
	 * created.
	 * @default undefined
	 * @instance
	 * @memberOf FragmentsEditor
	 * @review
	 * @type {!string}
	 */

	getAssetClassTypesURL: Config.string().required(),

	/**
	 * URL for obtaining the asset types for which asset display pages can be
	 * created.
	 * @default undefined
	 * @instance
	 * @memberOf FragmentsEditor
	 * @review
	 * @type {!string}
	 */

	getAssetDisplayContributorsURL: Config.string().required(),

	/**
	 * Optional ID provided by the template system.
	 * @default ''
	 * @instance
	 * @memberOf FragmentsEditor
	 * @review
	 * @type {string}
	 */

	id: Config.string().value(''),

	/**
	 * Image selector url
	 * @default undefined
	 * @instance
	 * @memberOf FragmentsEditor
	 * @review
	 * @type {!string}
	 */

	imageSelectorURL: Config.string().required(),

	/**
	 * List of fragment instances being used, the order
	 * of the elements in this array defines their position.
	 * @default []
	 * @instance
	 * @memberOf FragmentsEditor
	 * @review
	 * @type {Array<string>}
	 */

	fragmentEntryLinks: Config.arrayOf(
		Config.shapeOf(
			{
				config: Config.object().value({}),
				content: Config.any().value(''),
				editableValues: Config.object().value({}),
				fragmentEntryId: Config.string().required(),
				fragmentEntryLinkId: Config.string().required(),
				name: Config.string().required(),
				position: Config.number().required()
			}
		)
	).value([]),

	/**
	 * Portlet namespace needed for prefixing form inputs
	 * @default undefined
	 * @instance
	 * @memberOf FragmentsEditor
	 * @review
	 * @type {!string}
	 */

	portletNamespace: Config.string().required(),

	/**
	 * URL for getting a fragment content.
	 * @default undefined
	 * @instance
	 * @memberOf FragmentsEditor
	 * @review
	 * @type {!string}
	 */

	renderFragmentEntryURL: Config.string().required(),

	/**
	 * Selected mapping type label
	 * @default {}
	 * @instance
	 * @memberOf FragmentsEditor
	 * @review
	 * @type {{
	 *   subtype: string,
	 *   type: string
	 * }}
	 */

	selectedMappingTypeLabel: Config
		.shapeOf(
			{
				subtype: Config.string().value(''),
				type: Config.string().value('')
			}
		)
		.value({}),

	/**
	 * Tabs being shown in sidebar
	 * @default undefined
	 * @instance
	 * @memberOf FragmentsEditor
	 * @review
	 * @type {!Array<{
	 * 	 id: string,
	 * 	 label: string
	 * }>}
	 */

	sidebarTabs: Config.arrayOf(
		Config.shapeOf(
			{
				id: Config.string().required(),
				label: Config.string().required()
			}
		)
	).required(),

	/**
	 * Path of the available icons.
	 * @default undefined
	 * @instance
	 * @memberOf FragmentsEditor
	 * @review
	 * @type {!string}
	 */

	spritemap: Config.string().required(),

	/**
     * URL for swapping to fragmentEntryLinks.
     * @default undefined
     * @instance
     * @memberOf FragmentsEditor
     * @review
     * @type {!string}
     */

	updateFragmentEntryLinksURL: Config.string().required(),

	/**
	 * URL for updating the asset type associated to a template.
	 * @default undefined
	 * @instance
	 * @memberOf FragmentsEditor
	 * @review
	 * @type {!string}
	 */

	updateLayoutPageTemplateEntryAssetTypeURL: Config.string().required(),

	/**
	 * Allow opening/closing contextual sidebar
	 * @default true
	 * @instance
	 * @memberOf FragmentsEditor
	 * @private
	 * @review
	 * @type {boolean}
	 */

	_contextualSidebarVisible: Config.bool()
		.internal()
		.value(true),

	/**
	 * When true, it indicates that are changes pending to save.
	 * @default false
	 * @instance
	 * @memberOf FragmentsEditor
	 * @private
	 * @review
	 * @type {boolean}
	 */

	_dirty: Config.bool()
		.internal()
		.value(false),

	/**
	 * Last data when the autosave has been executed.
	 * @default ''
	 * @instance
	 * @memberOf FragmentsEditor
	 * @private
	 * @type {string}
	 */

	_lastSaveDate: Config.string()
		.internal()
		.value(''),

	/**
	 * Flag indicating if the SelectMappingTypeDialog should be shown
	 * @default false
	 * @instance
	 * @memberOf FragmentsEditor
	 * @private
	 * @review
	 * @type {boolean}
	 */

	_selectMappingTypeDialogVisible: Config
		.bool()
		.internal()
		.value(false),

	/**
	 * Tab selected inside sidebar
	 * @default 'fragments'
	 * @instance
	 * @memberOf FragmentsEditor
	 * @private
	 * @review
	 * @type {string}
	 */

	_sidebarSelectedTab: Config
		.string()
		.internal()
		.value(FragmentsEditor.DEFAULT_TAB_ID),

	/**
	 * Internal copy of the selected tabs that will be mutated.
	 * @default []
	 * @instance
	 * @memberOf FragmentsEditor
	 * @private
	 * @review
	 * @type {Array<{
	 * 	 id: string,
	 * 	 label: string
	 * }>}
	 */

	_sidebarTabs: Config.arrayOf(
		Config.shapeOf(
			{
				id: Config.string().required(),
				label: Config.string().required()
			}
		)
	).value([])
};

Soy.register(FragmentsEditor, templates);

export {FragmentsEditor};
export default FragmentsEditor;