<script lang="ts">
  import { Interact } from "../../store/interact";
  import Map from "./../map/map.svelte";
  import NoteTextualizer from "./../../components/note-textualizer/note-textualizer.svelte";
  import TrackerSmallBlock from "../../components/tracker-small-block/tracker-small-block.svelte";
  import { UserStore } from "./../../store/user-store.js";
  import { TrackerStore } from "../../store/tracker-store";
  import { LedgerStore } from "../../store/ledger.js";
  import Card from "./../../components/card/card.svelte";
  import Text from "./../../components/text/text.svelte";
  import HScroller from "./../../components/h-scroller/h-scroller.svelte";
  import NToolbarGrid from "./../../components/toolbar/toolbar-grid.svelte";
  import NToolbar from "./../../components/toolbar/toolbar.svelte";
  import NListItem from "./../../components/list-item/list-item.svelte";
  import NIcon from "./../../components/icon/icon.svelte";
  import NModal from "./../../components/modal/modal.svelte";
  import extractor from "../../utils/extract/extract";
  import math from "../../utils/math/math";
  import arrayUtils from "../../utils/array/array_utils";
  import dayjs from "dayjs";
  import TrackerConfig from "../../modules/tracker/tracker";
  import Button from "../../components/button/button.svelte";
  import ListItemLog from "../../components/list-item-log/list-item-log.svelte";
  import type NLog from "../../modules/nomie-log/nomie-log";
  import ButtonGroup from "../../components/button-group/button-group.svelte";
  import Icon from "./../../components/icon/icon.svelte";
  import Toolbar from "./../../components/toolbar/toolbar.svelte";
  import type { loop } from "svelte/internal";
  import { Lang } from "../../store/lang";
  import type Person from "../../modules/person/person";
  import TrackableElement from "../../modules/trackable-element/trackable-element";
  import { PeopleStore } from "../../store/people-store";
  import ShortcutUserButton from "../../components/shortcut-button/shortcut-user-button.svelte";
  import Row from "../../components/row/row.svelte";
  import Empty from "../empty/empty.svelte";
  import { getContext, getNotes, getPeople, OTDViews, processTrackers } from "./on-this-day-helpers";

  import type { OTDView, OTDViewOption } from "./on-this-day-helpers";
  import OnThisDayViews from "./on-this-day-views.svelte";

  const state = {
    notes: [],
    trackers: [],
    trackers1: [],
    trackers2: [],
    records: [],
    people: [],
    context: [],
    locations: [],
  };

  let showDom = false;
  let showWindow = false;
  let loading = false;

  let views: typeof OTDViews = OTDViews;

  let view: OTDViewOption = "notes";

  let activeView: OTDView = views[0];

  $: if ($Interact.onThisDay) {
    showDom = true;
    setTimeout(() => {
      showWindow = true;
    }, 20);
    loadDay();
  } else {
    showWindow = false;
    setTimeout(() => {
      showDom = false;
    }, 200);
  }

  function setView(v: OTDViewOption) {
    view = v;
    activeView = views.find((lview) => lview.view === v);
  }

  async function loadDay() {
    loading = true;
    let day = await LedgerStore.getDay($Interact.onThisDay);
    let trackersUsed = LedgerStore.extractTrackerTagAndValues(day);
    state.people = getPeople(day, $PeopleStore.people);
    state.context = getContext(day);
    state.notes = getNotes(day);
    state.trackers = processTrackers(trackersUsed);

    state.records = day;
    loading = false;
  }

  function nextDay() {
    let date = dayjs($Interact.onThisDay).add(1, "day").toDate();
    Interact.onThisDay(date);
  }

  function previousDay() {
    let date = dayjs($Interact.onThisDay).subtract(1, "day").toDate();
    Interact.onThisDay(date);
  }

  // let lastDate;
  // // $: if (date && date !== lastDate) {
  // //   lastDate = date;
  // //   loadDay();
  // // }
</script>

{#if showDom}
  <NModal show={showWindow} type="bottom-slideup" bodyClass="bg-solid-1" ariaLabel="On this day">
    <header slot="header" class="w-100">
      <div class="n-toolbar-grid">
        <div class="left">
          <Button icon className="tap-icon" on:click={Interact.closeOnThisDay}>
            <NIcon name="close" />
          </Button>
        </div>
        <div class="main py-1">
          <Text className="mt-1">{dayjs($Interact.onThisDay).format('ddd MMM D, YYYY')}</Text>
          <Row className="justify-content-center">
            <Text size="sm" className="mr-2">{activeView.label}</Text>
            <Text className="text-faded-3" size="sm">{dayjs($Interact.onThisDay).fromNow()}</Text>
          </Row>
        </div>
        <div class="right">
          <div class="n-row">
            <Button className="tap-icon px-1" on:click={previousDay}>
              <NIcon name="chevronLeft" />
            </Button>
            <Button className="tap-icon px-1" on:click={nextDay}>
              <NIcon name="chevronRight" />
            </Button>
          </div>
        </div>
      </div>
      <Toolbar>
        <ButtonGroup>
          {#each views as loopView}
            {#if loopView.view !== 'all'}
              <Button
                className={view === loopView.view ? 'active' : ''}
                icon
                on:click={() => {
                  setView(loopView.view);
                }}>
                <Icon name={loopView.icon} />
              </Button>
            {/if}
          {/each}
        </ButtonGroup>
      </Toolbar>
      <!-- <HScroller className="py-2">

        

      </HScroller> -->
    </header>

    {#if !loading}
      <OnThisDayViews {view} logs={state.records} />
    {/if}

  </NModal>
{/if}
