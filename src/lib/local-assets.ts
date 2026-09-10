import designerBed from "@/assets/designer-bed.png";
import diningSet from "@/assets/dining-set.png";
import dressingWardrobe from "@/assets/dressing-wardrobe.webp";
import logo from "@/assets/logo.webp";
import rockingChair from "@/assets/Rocking chair.png";
import sectionalSofa from "@/assets/sectional-sofa.png";
import showcaseCabinet from "@/assets/showcase-cabinet.webp";
import storefront from "@/assets/storefront.png";
import weddingSet1 from "@/assets/Wedding_set_1.png";
import weddingSet2 from "@/assets/Wedding_set_2.png";
import heroVideo from "@/assets/Video Project.mp4";

export {
  designerBed,
  diningSet,
  dressingWardrobe,
  logo,
  rockingChair,
  sectionalSofa,
  showcaseCabinet,
  storefront,
  weddingSet1,
  weddingSet2,
  heroVideo,
};

/** Maps the asset URLs written by Lovable's seed migration to locally bundled files. */
export const localAssetByFilename: Record<string, string> = {
  "designer-bed.png": designerBed,
  "dining-set.png": diningSet,
  "dressing-wardrobe.webp": dressingWardrobe,
  "sectional-sofa.png": sectionalSofa,
  "showcase-cabinet.webp": showcaseCabinet,
};
