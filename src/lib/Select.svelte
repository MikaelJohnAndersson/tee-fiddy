<script context="module" lang="ts">
  interface SelectOption {
    label: string;
    value: string;
  }
</script>

<script lang="ts">
  export let title: string;
  export let label: string;
  export let options: Array<SelectOption>;
  export let value: string = options[0].value;
</script>

<label>
  {label}
  <select bind:value {title}>
    {#each options as { label, value }}
      <option {value}>{label}</option>
    {/each}
  </select>
</label>
