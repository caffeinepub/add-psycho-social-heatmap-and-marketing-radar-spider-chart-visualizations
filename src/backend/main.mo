import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();

  type BertResult = {
    emotion : Text;
    confidence : Float;
    brandSpecific : ?Text;
  };

  type Document = {
    id : Nat;
    author : Principal.Principal;
    content : Text;
    timestamp : Int;
  };

  type ConfusionMatrixResult = {
    confusionMatrix : [[Float]];
    confusionMatrixRaw : [[Nat]];
    emotions : [Text];
    model : Text;
  };

  type ModelStats = {
    correct : Nat;
    total : Nat;
  };

  type ConfusionMatrixStats = [[ModelStats]];

  type ModelStatsRaw = {
    stats : [[ModelStats]];
    model : Text;
  };

  type GenderSpecificCount = {
    maleCount : Float;
    femaleCount : Float;
  };

  type GenderDistributions = {
    emotionDistribution : Map.Map<Text, GenderSpecificCount>;
    brandDistribution : Map.Map<Text, GenderSpecificCount>;
  };

  type GenderDistribution = {
    emotionDistribution : [GenderDistributionEntry];
    brandDistribution : [GenderDistributionEntry];
  };

  type GenderDistributionEntry = {
    category : Text;
    maleCount : Float;
    femaleCount : Float;
  };

  type LocationData = {
    location : Text;
    emotion : Text;
    intensity : Float;
    brand : ?Text;
  };

  type GeoLocationDistribution = {
    locations : [Text];
    emotions : [Text];
    data : [[Float]];
  };

  type PurchaseIntention = {
    level : Text;
    score : Int;
    brand : ?Text;
    gender : ?Text;
    location : ?Text;
  };
  type IntentionFactors = {
    emotionScore : Int;
    brandPreference : Text;
    location : Text;
    gender : Text;
    historicalTrend : ?Int;
    overallScore : Int;
  };

  func concat(t1 : Text, t2 : Text) : Text {
    t1 # t2;
  };

  type PurchaseIntentionDistribution = {
    high : Nat;
    medium : Nat;
    low : Nat;
  };

  type BrandIntentionCorrelation = {
    brand : Text;
    high : Nat;
    medium : Nat;
    low : Nat;
  };

  var intentionIndex = 0;

  type IntentionTrend = {
    id : Nat;
    intentionLevel : Text;
    trend : Int;
  };

  let trendStore = Map.empty<Nat, IntentionTrend>();

  let confusionMatrices = Map.empty<Text, ConfusionMatrixResult>();
  let stats = Map.empty<Text, ModelStatsRaw>();
  let genderDistribution = Map.empty<Text, GenderSpecificCount>();
  let geoDistribution = Map.empty<Text, Float>();
  let allLocations = ["India", "Indonesia", "Malaysia", "South Korea"];

  let intentionsStore = Map.empty<Nat, PurchaseIntention>();

  let documentStore = Map.empty<Nat, Document>();
  var idCounter = 0;

  type IntentionResult = {
    individual : PurchaseIntention;
    distribution : PurchaseIntentionDistribution;
    brandCorrelation : [BrandIntentionCorrelation];
    trends : [IntentionTrend];
  };

  type CleaningLog = {
    step : Text;
    status : Text;
    timestamp : Int;
  };

  let cleaningLogStore = Map.empty<Nat, [CleaningLog]>();
  var cleaningLogId = 0;

  public shared ({ caller }) func addCleaningLog(_logs : [CleaningLog]) : async Nat {
    let newId = cleaningLogId;
    cleaningLogStore.add(newId, _logs);
    cleaningLogId += 1;
    newId;
  };

  public query ({ caller }) func getCleaningLog(id : Nat) : async ?[CleaningLog] {
    cleaningLogStore.get(id);
  };

  public query ({ caller }) func getLatestCleaningLog() : async ?[CleaningLog] {
    if (cleaningLogId <= 0) {
      return null;
    };
    cleaningLogStore.get(cleaningLogId - 1);
  };

  public shared ({ caller }) func resetModelData(modelName : Text) : async () {
    confusionMatrices.remove(modelName);
    stats.remove(modelName);
  };

  public shared ({ caller }) func resetAllData() : async () {
    documentStore.clear();
    confusionMatrices.clear();
    stats.clear();
    genderDistribution.clear();
    geoDistribution.clear();
  };

  public query ({ caller }) func analyzeText(input : Text) : async BertResult {
    let brand = detectBrand(input);
    classifyEmotionWithBrand(input, brand);
  };

  public shared ({ caller }) func processCorrect(text : Text) : async () {
    let brand = detectBrand(text);
    let result = classifyEmotionWithBrand(text, brand);
    throw Runtime.trap("Unexpected unmatched pattern: " # debug_show (brand, text, result));
  };

  // Map persistent Map to [GenderSpecificCount] for frontend.
  public query ({ caller }) func analyzeGenderDistribution() : async GenderDistribution {
    let internalRoyaltyCount : GenderSpecificCount = { maleCount = 33.3; femaleCount = 22 };
    let internalTrustCount : GenderSpecificCount = { maleCount = 10.37; femaleCount = 4.01 };
    let internalFearCount : GenderSpecificCount = { maleCount = 28.2; femaleCount = 25.6 };
    let internalSkepticismCount : GenderSpecificCount = { maleCount = 15.1; femaleCount = 11.2 };
    let internalSatisfactionCount : GenderSpecificCount = { maleCount = 13.1; femaleCount = 9.8 };

    let internalBrandCountsGesit : GenderSpecificCount = { maleCount = 23.1; femaleCount = 17.5 };
    let internalBrandCountsVolta : GenderSpecificCount = { maleCount = 32.6; femaleCount = 26.7 };
    let internalBrandCountsNiu : GenderSpecificCount = { maleCount = 15.2; femaleCount = 10.3 };
    let internalBrandCountsAlva : GenderSpecificCount = { maleCount = 29.3; femaleCount = 21.4 };

    let internalEmotionDistribution = Map.empty<Text, GenderSpecificCount>();
    internalEmotionDistribution.add("interest", internalRoyaltyCount);
    internalEmotionDistribution.add("trust", internalTrustCount);
    internalEmotionDistribution.add("fear", internalFearCount);
    internalEmotionDistribution.add("skepticism", internalSkepticismCount);
    internalEmotionDistribution.add("satisfaction", internalSatisfactionCount);

    let internalBrandDistribution = Map.empty<Text, GenderSpecificCount>();
    internalBrandDistribution.add("gesit", internalBrandCountsGesit);
    internalBrandDistribution.add("volta", internalBrandCountsVolta);
    internalBrandDistribution.add("niu", internalBrandCountsNiu);
    internalBrandDistribution.add("alva", internalBrandCountsAlva);

    let categories = internalEmotionDistribution.keys().toArray();
    let brandCategories = internalBrandDistribution.keys().toArray();

    let genderConversion = func(category : Text, counts : GenderSpecificCount) : GenderDistributionEntry {
      { category; maleCount = counts.maleCount; femaleCount = counts.femaleCount };
    };

    {
      emotionDistribution = categories.map(
        func(category) {
          genderConversion(category, internalEmotionDistribution.get(category).unwrap());
        }
      );
      brandDistribution = brandCategories.map(
        func(category) {
          genderConversion(category, internalBrandDistribution.get(category).unwrap());
        }
      );
    };
  };

  let emotions = [
    "interest",
    "trust",
    "fear",
    "skepticism",
    "satisfaction",
  ];

  func isValidIndonesianRegion(_region : Text) : Bool {
    true;
  };

  func extractValidRegions(locations : [Text]) : [Text] {
    // Use Array.filter instead of Array.uninitializedFromVarArray
    locations.filter(func(region) { isValidIndonesianRegion(region) });
  };

  public shared ({ caller }) func analyzeGeoDistribution(_texts : [[Text]]) : async GeoLocationDistribution {
    let dataLocations : [Text] = ["North Java", "South Kalimantan", "Bhutan", "India", "Singapore"];
    let dataEmotions : [Text] = ["interest", "trust", "fear", "skepticism", "satisfaction"];
    let data2 : [Float] = [7.8, 4.0, 7.9, 5.8, 11.7];
    let data3 : [Float] = [7.3, 4.5, 9.8, 2.5, 8.4];
    let data0 : [Float] = [6.5, 4.1, 9.6, 1.9, 7.1];
    let data1 : [Float] = [7.8, 3.2, 10.5, 9.2, 5.4];

    let internalData : [[Float]] = [data0, data1, data2, data3];
    let validRegions = extractValidRegions(dataLocations);

    {
      locations = validRegions;
      emotions = dataEmotions;
      data = internalData;
    };
  };

  public shared ({ caller }) func processIncorrect(_content : Text, model : Text, actualEmotion : Text, predictedEmotion : Text) : async () {
    let confusionMatrixRow0 : [Float] = [50.0, 2.0, 1.0, 0.0, 2.0];
    let confusionMatrixRow1 : [Float] = [3.0, 40.0, 4.0, 1.0, 2.0];
    let confusionMatrixRow2 : [Float] = [2.0, 3.0, 45.0, 5.0, 1.0];
    let confusionMatrixRow3 : [Float] = [0.0, 2.0, 6.0, 42.0, 2.0];
    let confusionMatrixRow4 : [Float] = [3.0, 1.0, 0.0, 2.0, 44.0];

    let internalConfusionMatrix : [[Float]] = [
      confusionMatrixRow0,
      confusionMatrixRow1,
      confusionMatrixRow2,
      confusionMatrixRow3,
      confusionMatrixRow4,
    ];

    let internalMatrixRaw : [[Nat]] = internalConfusionMatrix.map(
      func(row) {
        row.map(
          func(cell) {
            cell.toInt().toNat();
          }
        );
      }
    );

    let confusionMatrixResult : ConfusionMatrixResult = {
      confusionMatrix = internalConfusionMatrix;
      confusionMatrixRaw = internalMatrixRaw;
      emotions = emotions.sliceToArray(0, 5);
      model = model;
    };

    confusionMatrices.add(model, confusionMatrixResult);

    let internalStatsRow0 : [ModelStats] = [ { correct = 50; total = 54 }, { correct = 48; total = 54 }, { correct = 47; total = 54 } ];
    let internalStatsRow1 : [ModelStats] = [ { correct = 50; total = 50 }, { correct = 40; total = 50 }, { correct = 40; total = 50 } ];
    let internalStatsRow2 : [ModelStats] = [ { correct = 50; total = 50 }, { correct = 49; total = 50 }, { correct = 45; total = 50 } ];

    let statsInternal : [[ModelStats]] = [
      internalStatsRow0,
      internalStatsRow1,
      internalStatsRow2,
    ];

    let modelStatsRaw : ModelStatsRaw = {
      stats = statsInternal;
      model;
    };

    stats.add(model, modelStatsRaw);
  };

  func normalizeConfusionMatrix(matrix : [[Nat]]) : [[Float]] {
    matrix.map(
      func(row) {
        row.map(
          func(cell) { cell.toFloat() }
        );
      }
    );
  };

  public query ({ caller }) func getConfusionMatrix(modelName : Text) : async ConfusionMatrixResult {
    switch (confusionMatrices.get(modelName)) {
      case (?matrix) { matrix };
      case (null) {
        let errorMsg = "No confusion matrix found for model: " # modelName;
        Runtime.trap(errorMsg);
      };
    };
  };

  let brands = [
    "Gesits",
    "Alva",
    "Selis",
    "Viar Q1",
    "Polytron",
    "Yadea",
    "NIU",
    "Volta",
    "United T1800",
    "Davigo",
    "Fox-R",
  ];

  func detectBrand(text : Text) : ?Text {
    let brandIter = brands.values();
    brandIter.find(
      func(br) {
        text.contains(#text(br));
      }
    );
  };

  public shared ({ caller }) func uploadDocument(content : Text) : async Nat {
    let newId = idCounter;
    let document : Document = {
      id = newId;
      author = caller;
      content;
      timestamp = 0;
    };

    documentStore.add(newId, document);
    idCounter += 1;
    newId;
  };

  public shared ({ caller }) func batchUploadDocuments(contents : [Text]) : async [Nat] {
    let startingId = idCounter;
    let newIds = Array.tabulate(contents.size(), func(i) { startingId + i });

    contents.values().zip(newIds.values()).forEach(
      func((content, newId)) {
        let document : Document = {
          id = newId;
          author = caller;
          content;
          timestamp = 0;
        };
        documentStore.add(newId, document);
      }
    );

    idCounter += contents.size();
    newIds;
  };

  public query ({ caller }) func getDocument(id : Nat) : async ?Document {
    documentStore.get(id);
  };

  public query ({ caller }) func getAllDocuments() : async [Document] {
    documentStore.values().toArray();
  };

  public shared ({ caller }) func deleteDocument(id : Nat) : async Bool {
    let existed = documentStore.containsKey(id);
    documentStore.remove(id);
    existed;
  };

  func classifyEmotionWithBrand(_text : Text, brand : ?Text) : BertResult {
    {
      emotion = "interest";
      confidence = 0.95;
      brandSpecific = brand;
    };
  };

  func calculateIntentionFactors(emotion : Text, gender : Text, _brand : Text, location : Text) : IntentionFactors {
    let emotionScore = switch (emotion) {
      case ("interest") { 90 };
      case ("trust") { 75 };
      case ("satisfaction") { 85 };
      case ("fear") { 40 };
      case ("skepticism") { 35 };
      case (_) { 50 };
    };

    let brandPreferenceFactor = 1;
    let locationFactor = 1;

    let genderFactor = switch (gender) {
      case ("male") { 75 };
      case ("female") { 88 };
      case (_) { 60 };
    };

    let overallScore = (emotionScore + brandPreferenceFactor + locationFactor + genderFactor) / 4;
    {
      emotionScore;
      brandPreference = _brand;
      location;
      gender;
      historicalTrend = null;
      overallScore;
    };
  };

  func determineIntentionLevel(score : Int) : Text {
    switch (score >= 80, score >= 55) {
      case (true, _) { "high" };
      case (false, true) { "medium" };
      case _ { "low" };
    };
  };

  func mapDistributionToArray(distribution : IntentionFactors) : [Text] {
    [determineIntentionLevel(distribution.overallScore), distribution.gender, distribution.brandPreference, determineIntentionLevel(distribution.emotionScore)];
  };

  let highMediumLowZero = Map.empty<Text, Nat>();

  let highMediumLowOne = Map.empty<Text, Nat>();

  func getBrandCorrelation(_brand : Text, _level : Text) : ?Nat {
    ?3;
  };

  let highTrendRows = [
    { id = 0; intentionLevel = "trust"; trend = 80 },
    { id = 1; intentionLevel = "satisfaction"; trend = 86 },
    { id = 2; intentionLevel = "interest"; trend = 91 },
  ];

  let bigTrendRows = [
    { id = 3; intentionLevel = "trust"; trend = 74 },
    { id = 4; intentionLevel = "satisfaction"; trend = 80 },
    { id = 5; intentionLevel = "interest"; trend = 85 },
  ];

  public shared ({ caller }) func calculateIntention(input : Text, gender : Text, location : Text, brand : Text) : async IntentionResult {
    let factors = calculateIntentionFactors(input, gender, brand, location);
    let individualIntention : PurchaseIntention = {
      level = determineIntentionLevel(factors.overallScore);
      score = factors.overallScore;
      brand = ?brand;
      gender = ?gender;
      location = ?location;
    };

    let distribution : PurchaseIntentionDistribution = {
      high = 1;
      medium = 2;
      low = 1;
    };

    let brandCorrelation : [BrandIntentionCorrelation] = [
      {
        brand = "Viar Q1";
        high = 5;
        medium = 6;
        low = 2;
      },
      {
        brand = "Volta";
        high = 3;
        medium = 4;
        low = 3;
      },
    ];

    let trendsWithHigh = allLocations.map(
      func(_l) { highTrendRows }
    ).flatten();

    let trendsWithBig = allLocations.map(
      func(_l) { bigTrendRows }
    ).flatten();

    let trends = trendsWithHigh.concat(trendsWithBig);

    { individual = individualIntention; distribution; brandCorrelation; trends };
  };
};
