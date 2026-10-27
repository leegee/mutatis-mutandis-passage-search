import { createEffect, onMount, Show, untrack } from "solid-js";
import { CONFIG } from "../config.js";
import { store } from "../store.js";
import { checkApi, runSearch } from "../actions.js";
import { runTextSearch } from "../textActions.js";
import { toast } from "../toast.js";
import { route, match, ROUTES } from "../router.js";
import {
	routeSync,
	applySemanticParams,
	applyTextParams,
	hasSemanticQuery,
	hasTextQuery,
} from "../urlState.js";
import { SearchView } from "./SearchView.jsx";
import { TextSearchView } from "./TextSearchView.jsx";
import { NotFound } from "./NotFound.jsx";

export function App() {
	onMount(checkApi);

	// Persist the form state (not the results) across reloads.
	createEffect(() => {
		const snap = store.panes.map((p) => ({
			label: p.label,
			source: { ...p.source },
			form: { ...p.form },
			negatives: p.negatives.map((n) => ({ ...n })),
		}));
		try {
			localStorage.setItem(CONFIG.storageKey, JSON.stringify(snap));
		} catch {
			/* ignore */
		}
	});

	// Hydrate from hash on load and on back/forward (and deep links).
	createEffect(() => {
		const r = route(); // track
		if (routeSync.suppressApply) {
			routeSync.suppressApply = false;
			return;
		}

		const firstId = untrack(() => store.panes[0]?.id);
		if (match(ROUTES.home) || match(ROUTES.search)) {
			if (firstId && hasSemanticQuery(r.params)) {
				applySemanticParams(r.params, firstId);
				runSearch(firstId, { updateUrl: false });
			}
		} else if (match(ROUTES.text)) {
			if (hasTextQuery(r.params)) {
				applyTextParams(r.params);
				runTextSearch({ updateUrl: false });
			}
		}
	});

	const isSearch = () => match(ROUTES.home) || match(ROUTES.search);
	const isText = () => match(ROUTES.text);

	return (
		<div class="shell">
			<Show when={isSearch()}>
				<SearchView />
			</Show>
			<Show when={isText()}>
				<TextSearchView />
			</Show>
			<Show when={!isSearch() && !isText()}>
				<NotFound />
			</Show>
			<div class={"toast" + (toast() ? " show" : "")} role="status">
				{toast()}
			</div>
		</div>
	);
}
