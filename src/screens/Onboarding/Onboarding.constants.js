import { L10N } from '../../modules';

const getSlides = () => [
  {
    title: L10N.ONBOARDING_1_TITLE,
    subtitle: L10N.ONBOARDING_1_MESSAGE,
    detail: L10N.ONBOARDING_1_DETAIL,
    image: require('../../../assets/images/alice.png'),
  },
  {
    title: L10N.ONBOARDING_2_TITLE,
    subtitle: L10N.ONBOARDING_2_MESSAGE,
    detail: L10N.ONBOARDING_2_DETAIL,
    image: require('../../../assets/images/bob-eve.png'),
  },
  {
    title: L10N.ONBOARDING_3_TITLE,
    subtitle: L10N.ONBOARDING_3_MESSAGE,
    detail: L10N.ONBOARDING_3_DETAIL,
    image: require('../../../assets/images/alice-bob.png'),
  },
  {
    title: L10N.ONBOARDING_4_TITLE,
    subtitle: L10N.ONBOARDING_4_MESSAGE,
    detail: L10N.ONBOARDING_4_DETAIL,
    image: require('../../../assets/images/alice-join.png'),
  },
];

export { getSlides };
