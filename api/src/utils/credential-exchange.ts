import moment from "moment";
import {
  AriesCredentialAttribute,
  AriesCredentialOffer,
  AriesCredentialPreview,
} from "../models/credential-exchange";
//import { UserInfo } from "../models/credential";

export function formatCredentialOffer(
  connection_id: string,
  comment: string,
  attributes: AriesCredentialAttribute[],
  cred_def_id: string
): AriesCredentialOffer {
  return {
    connection_id,
    comment,
    cred_def_id,
    credential_preview: {
      "@type":
        "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/issue-credential/1.0/credential-preview",
      attributes: attributes,
    },
    auto_remove: false,
    trace: false,
  };
}

export function formatCredentialPreview(
  attributes: AriesCredentialAttribute[]
): AriesCredentialPreview {
  const issued = {
    name: "issued",
    value: moment().toISOString(),
  } as AriesCredentialAttribute;
  return {
    "@type":
      "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/issue-credential/1.0/credential-preview",
    attributes: [...attributes],
  };
}

export function tierChecker(attributes: any) {
  const TIER_1 = [
    "first_name",
    "middle_name",
    "last_name",
    "other_name",
    "phone_number",
    "email",
    "home_address",
    "unit",
    "postal_code",
    "city",
    "province",
  ];
  const TIER_2 = [
    "date_of_birth",
    "birth_city",
    "birth_country",
    "sex",
    "license_number",
    "dd",
    "class",
    "expiration_date",
    "eye_color",
    "height",
  ];
  const TIER_3 = [
    "sin",
    "health_principal_name",
    "health_card_number",
    "health_coverage_start_date",
    "bank_institution_number",
    "bank_transit_code",
    "bank_account_number",
  ];
  let tier_1_count = 0;
  let tier_2_count = 0;
  let tier_3_count = 0;
  attributes.forEach((info: any) => {
    console.log(`current info : ${JSON.stringify(info)}`);
    if (info.value.toString().trim() != "") {
      if (TIER_1.includes(info.name)) {
        tier_1_count++;
      }
      if (TIER_2.includes(info.name)) {
        tier_2_count++;
      }
      if (TIER_3.includes(info.name)) {
        tier_3_count++;
      }
    }
  });
  let tier = 0;
  if (tier_1_count == TIER_1.length) {
    if (tier_2_count == TIER_2.length) {
      if (tier_3_count == TIER_3.length) {
        tier = 3;
      } else {
        tier = 2;
      }
    } else {
      tier = 1;
    }
  }
  return tier;
  // const pass_tier_1 =
  //   attributes.filter(
  //     ({ name, value }: any) => TIER_1.includes(name) && value !== ""
  //   ).length == TIER_1.length;
  // if (pass_tier_1) {
  //   const pass_tier_2 =
  //     attributes.filter(
  //       ({ name, value }: any) => TIER_2.includes(name) && value !== ""
  //     ).length == TIER_2.length;
  //   if (pass_tier_2) {
  //     const pass_tier_3 =
  //       attributes.filter(
  //         ({ name, value }: any) => TIER_3.includes(name) && value !== ""
  //       ).length == TIER_3.length;
  //     if (pass_tier_3) {
  //       return 3;
  //     } else {
  //       return 2;
  //     }
  //   } else {
  //     return 1;
  //   }
  // } else {
  //   return 0;
  // }
}
