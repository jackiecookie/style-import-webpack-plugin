<template>
  <div>测试</div>
</template>

<script>
import { Button } from "./element";
export default {
  beforeCreate(conetxt) {
    conetxt.Button = Button
  }
};
</script>

