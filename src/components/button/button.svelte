<script>
  import { createEventDispatcher } from "svelte";
  import Ripple from "./ripple.svelte";
  import { press } from "svelte-hammer";

  const dispatch = createEventDispatcher();
  export let id = undefined;
  export let size = "md";
  export let type = "";
  export let shape = "rounded";
  export let color = "primary";
  export let className = "";
  export let block = false;
  export let style = "";
  export let disabled = false;
  export let delay = 300;
  export let icon = false;
  export let title = undefined;
  export let ariaLabel = undefined;
  export let prevent = false;
  export let inline = false;
  export let text = false;
  export let confirm = false;

  let hit;
  let confirming = false;
  let confirmTimeout;

  function onClick(evt) {
    if(confirm) {
      clearTimeout(confirmTimeout);
      if(confirming) {
        dispatch('click',evt);
        confirming = false;
      } else {
        confirming = true;
        confirmTimeout = setTimeout(()=>{
          confirming = false;
        },3000);
      }
    } else {
      dispatch('click',evt);
    }
  }

</script>

<style>
  .nbtn {
    position: relative;
    overflow: hidden;
    text-align: left;
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  /* .nbtn svg {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
  } */

  :global(.nbtn.confirming) {
    background-color: var(--color-red);
    color: #FFF;
  }

  :global(.btn.btn-inline) {
    display: inline-flex;
  }
  
</style>

<button
  {id}
  {style}
  {disabled}
  class:confirming
  class={`nbtn ${block ? 'nbtn-block' : ''} ${icon ? 'nbtn-icon' : ''} nbtn-${type} nbtn-${shape} nbtn-${color} nbtn-${size} ${inline ? 'nbtn-inline' : ''} ${text ? 'nbtn-text' : ''} ${className}`}
  {title}
  use:press
  on:press={(e) => {
    dispatch('longpress', e);
    e.preventDefault();
    e.stopPropagation();
  }}
  aria-label={ariaLabel || title}
  on:click|preventDefault|stopPropagation={(evt) => {
    hit = [evt.offsetX, evt.offsetY];
    if (prevent) {
      evt.preventDefault();
      evt.stopPropagation();
    }
    if (delay) {
      setTimeout(() => {
        // dispatch('click', evt);
        onClick(evt);
      }, delay);
    } else {
      // dispatch('click', evt);
      onClick(evt);
    }
  }}>
  <Ripple bind:hit />
  <slot name="left" />
  <main>
    <slot />
  </main>
  <slot name="right" />
</button>
