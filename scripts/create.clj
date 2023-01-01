(ns scripts.create
  (:require [clojure.edn :as edn]
            [selmer.parser :as p]
            [com.rpl.specter :as specter]
            [scripts.util :as util]))

(def ^:private defaults
  {:title "An Annotated Document"
   :authorship ""
   :content []
   :frontmatter {:bylines []
                 :intros []}
   :backmatter {:outros []
                :fine-prints []}
   :meta {:description ""
          :locale "en_US"
          :theme-color ""
          :site-name ""
          :image ""
          :image-alt ""
          :image-width ""
          :image-height ""
          :url ""
          :twitter-card ""
          :twitter-creator ""
          :icon {:apple-touch-icon ""
                 :icon-png-32x32 ""
                 :icon-png-16x16 ""}}})

(defn- number-marks
  "Cheap hack to properly number highlighted text.
   1. Add sequential numbers only to text sections with marks.
   2. Ignore if one or less marks."
  [data]
  (let [r (fn [[n v] m]
            (let [mark? (:mark m)]
              [(if mark? (inc n) n)
               (conj v (if mark?
                         (assoc-in m [:mark :dai] n)
                         m))]))
        f #(if (> (count (filter :mark %)) 1)
             (second (reduce r [1 []] %))
             %)]
    (specter/transform [:content specter/ALL :quote] f data)))

(defn- add-authorship-byline
  "Add the author given in data file as a document byline."
  [data]
  (let [{:keys [authorship]} data]
    (update-in data [:frontmatter :bylines] #(into [authorship] %))))

(defn- add-plug
  "Add backmatter link to original project."
  [data]
  (let [plug "Page built with <a href=\"https://github.com/molly/annotate\">Annotate</a>."]
    (update-in data [:backmatter :fine-prints] conj plug)))

(defn- prep-data
  "Data transformations necessary for rendering."
  [data]
  (-> (util/deep-merge defaults data)
      number-marks
      add-plug
      add-authorship-byline))

#_{:clj-kondo/ignore [:clojure-lsp/unused-public-var]}
(defn write-file!
  "Spit an individual populated HTML page."
  ([infile outfile]
   (p/cache-off!)
   (let [data (->> infile slurp edn/read-string prep-data)]
     (spit outfile
           (p/render-file "templates/page.html" data))))
  ([& _]
   (println "Supply two positional arguments, paths to an existing infile EDN and an HTML outfile")))
