import { L10N } from '../../modules';

const getSlides = () => [
  {
    title: L10N.ONBOARDING_1_TITLE,
    message: L10N.ONBOARDING_1_MESSAGE,
    image: require('../../../assets/images/alice.png'),
  },
  {
    title: L10N.ONBOARDING_2_TITLE,
    message: L10N.ONBOARDING_2_MESSAGE,
    image: require('../../../assets/images/bob-eve.png'),
  },
  {
    title: L10N.ONBOARDING_3_TITLE,
    message: L10N.ONBOARDING_3_MESSAGE,
    image: require('../../../assets/images/alice-bob.png'),
  },
  {
    title: L10N.ONBOARDING_4_TITLE,
    message: L10N.ONBOARDING_4_MESSAGE,
    image: require('../../../assets/images/alice-join.png'),
  },
];

export { getSlides };
