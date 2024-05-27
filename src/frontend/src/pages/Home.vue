<template>
  <div class="home max-w-none">
    <nav class="dot-navigation">
      <ul>
        <li v-for="(section, index) in sections" :key="index" :class="{ active: isActiveSection(index) }"
          @click="scrollToSection(index)"></li>
      </ul>
    </nav>
    <div class="sticky top-0 z-50">
      <AnnouncementBanner />
      <HeaderBar />
    </div>

    <div class="flex flex-col">
      <div ref="section0" class="full-screen-section">
        <HomeSection1 />
      </div>
      <div ref="section1" class="full-screen-section">
        <HomeSection2 />
      </div>
    </div>

    <div class="mt-20">
      <FooterBar></FooterBar>
    </div>
  </div>
</template>


<script>
import HeaderBar from '../components/HeaderBar.vue';
import AnnouncementBanner from '../components/AnnouncementBanner.vue';
import LoginButton from '../components/LoginButton.vue';
import FooterBar from '../components/FooterBar.vue';
import HomeSection1 from './HomeSection1.vue';
import HomeSection2 from './HomeSection2.vue';

import InfoBoxWithButton from '../components/InfoBoxWithButton.vue';

export default {
  components: {
    HomeSection1,
    HomeSection2,
    LoginButton,
    InfoBoxWithButton,
    AnnouncementBanner,
    HeaderBar,
    FooterBar,
  },
  data() {
    return {
      sections: ['section0', 'section1'],
      currentActiveIndex: 0
    };
  },
  methods: {
    scrollToSection(index) {
      try {
        if (index === 0) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          const sectionRef = this.$refs[this.sections[index]];
          if (sectionRef) {
            sectionRef.scrollIntoView({ behavior: 'smooth' });
          } else {
            console.error(`No ref found for section ${this.sections[index]}`);
          }
        }
        this.currentActiveIndex = index;
      } catch (error) {
        console.error(error);
      }
    },
    isActiveSection(index) {
      return index === this.currentActiveIndex;
    },
    onWheel(e) {
      e.preventDefault();
      if (e.deltaY > 0) {
        this.scrollToSection(Math.min(this.currentActiveIndex + 1, this.sections.length - 1));
      } else {
        this.scrollToSection(Math.max(this.currentActiveIndex - 1, 0));
      }
    },
    onKeydown(e) {
      switch (e.code) {
        case 'ArrowUp':
        case 'PageUp':
          this.scrollToSection(Math.max(this.currentActiveIndex - 1, 0));
          break;
        case 'ArrowDown':
        case 'PageDown':
          this.scrollToSection(Math.min(this.currentActiveIndex + 1, this.sections.length - 1));
          break;
      }
    },
  },

  mounted() {
    window.addEventListener('wheel', this.onWheel, { passive: false });
    window.addEventListener('keydown', this.onKeydown);
    this.scrollToSection(this.currentActiveIndex);
  },

  beforeDestroy() {
    window.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('keydown', this.onKeydown);
  },
};
</script>

<style>
body {
  overflow: hidden;
}

.dot-navigation {
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

.dot-navigation ul {
  list-style: none;
  margin-right: 1.5 rem;
  padding: 0;
}

.dot-navigation li {
  width: 3rem;
  height: 3rem;
  background: #000;
  border-radius: 50%;
  margin-bottom: 10px;
  cursor: pointer;
}

.dot-navigation li.active {
  background: rgb(81, 0, 255);
}

.full-screen-section {
  width: 100vw;
  height: 100vh;
  overflow: auto;
}
</style>