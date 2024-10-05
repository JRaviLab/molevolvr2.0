import { FaPenNib } from "react-icons/fa6";
import Flex from "@/components/Flex";
import Heading from "@/components/Heading";
import Link from "@/components/Link";
import Meta from "@/components/Meta";
import Section from "@/components/Section";
import classes from "./About.module.css";

const About = () => {
  return (
    <>
      <Meta title="About" />

      <Section>
        <Heading level={1} icon={<FaPenNib />}>
          About
        </Heading>
      </Section>

      <Section className={classes.section}>
        <Heading level={2}>FAQs</Heading>

        <Heading level={3} anchor="receive-an-email">
          Will I receive an email when the job is done?
        </Heading>

        <p>
          Yes, if you supplied an (optional) email on the submission page, then
          an email will be sent to confirm when a job is ready.
        </p>

        <Heading level={3} anchor="how-to-paste-protein-sequences">
          How to paste/upload protein sequences?
        </Heading>

        <Heading level={3} anchor="interproscan">
          Acceptable formats
        </Heading>

        <ul>
          <li className={classes.list}>
            <Link to="https://www.ncbi.nlm.nih.gov/genbank/fastaformat">
              NCBI FASTA
            </Link>

            <pre>
              <code className={classes.code}>
                {">"}sp|P01189|COLI_HUMAN Pro-opiomelanocortin OS=Homo sapiens
                OX=9606 GN=POMC PE=1 SV=2
                MPRSCCSRSGALLLALLLQASMEVRGWCLESSQCQDLTTESNLLECIRACKPDLSAETPM
                FPGNGDEQPLTENPRKYVMGHFRWDRFGRRNSSSSGSSGAGQKREDVSAGEDCGPLPEGG
                PEPRSDGAKPGPREGKRSYSMEHFRWGKPVGKKRRPVKVYPNGAEDESAEAFPLEFKREL
                TGQRLREGDGPDGPADDGAGAQADLEHSLLVAAEKKDEGPYRMEHFRWGSPPKDKRYGGF
                MTSEKSQTPLVTLFKNAIIKNAYKKGE
              </code>
            </pre>
          </li>

          <li className={classes.list}>
            <Link to="https://www.uniprot.org/help/fasta-headers">
              UniProt FASTA
            </Link>

            <pre>
              <code className={classes.code}>
                {">"}sp|P01189|COLI_HUMAN Pro-opiomelanocortin OS=Homo sapiens
                OX=9606 GN=POMC PE=1 SV=2
                MPRSCCSRSGALLLALLLQASMEVRGWCLESSQCQDLTTESNLLECIRACKPDLSAETPM
                FPGNGDEQPLTENPRKYVMGHFRWDRFGRRNSSSSGSSGAGQKREDVSAGEDCGPLPEGG
                PEPRSDGAKPGPREGKRSYSMEHFRWGKPVGKKRRPVKVYPNGAEDESAEAFPLEFKREL
                TGQRLREGDGPDGPADDGAGAQADLEHSLLVAAEKKDEGPYRMEHFRWGSPPKDKRYGGF
                MTSEKSQTPLVTLFKNAIIKNAYKKGE
              </code>
            </pre>
          </li>

          <li className={classes.list}>
            <span>Custom FASTA header (not recommended)</span>

            <pre>
              <code className={classes.code}>
                {">"}SEQUENCE154 UNKNOWN
                <br />
                MPRSCCSRSGALLLALLLQASMEVRGWCLESSQCQDLTTESNLLECIRACKPDLSAETPM FPG
              </code>
            </pre>
          </li>
        </ul>

        <p>
          The application uses NCBI or UniProt accessions to get taxonomy info
          from query proteins. Therefore, it is recommended to include valid
          protein accession numbers in the header when possible.
        </p>

        <Heading level={3} anchor="common-mistakes">
          Common mistakes
        </Heading>

        <ul>
          <li className={classes.list}>
            <p>
              No header lines (missing <code>{">"}</code> header delimiter)
            </p>

            <pre>
              <code className={classes.code}>
                MRIDKFLANMGVGTRNEVKQLLKKGLVNVNEQVIKSPKTHIEPENDKITVRGELIEYIENVYIMLNKPKG
                <br />
                MPRSCCSRSGALLLALLLQASMEVRGWCLESSQCQDLTTESNLLECIRACKPDLSAETPM
              </code>
            </pre>
          </li>

          <li className={classes.list}>
            <p>Duplicate headers/accnums</p>

            <pre>
              <code className={classes.code}>
                {">"}GCF_000013425.1
                <br />
                MVPEEKGSITLSKEAAIIFAIAKFKPFKNRIKNNPQKTNPFLKLHENKKS
                <br />
                {">"}GCF_000013425.1
                <br />
                MKQKKSKNIFWVFSILAVVFLVLFSFAVGASNVPMMILTFILLVATFGIGFTTKKKYRENDWL
                <br />
                {">"}protein
                <br />
                MKLTLMKFFVGGFAVLLSYIVSVTLPWKEFGGIFATFPAVFLVSMFITGMQYGDKVAVHVSRGAVFGMTGVLVCILVTWM
                MLHMTHMWLISIVVGFLSWFISAVCIFEAVEFIAQKRLEKHSWKAGKSNSK
                <br />
                {">"}protein
                <br />
                MVKRTYQPNKRKHSKVHGFRKRMSTKNGRKVLARRRRKGRKVLSA
              </code>
            </pre>
          </li>
        </ul>

        <Heading level={3} anchor="is-job-running">
          Is my job still running? Did it complete?
        </Heading>

        <div>
          <p>
            Upon submission, a url link to retrieve the results will display.{" "}
            <b>
              The link provides job progress info and, once finished, the
              results.
            </b>
          </p>

          <p>Recommendations:</p>

          <ul>
            <li>Bookmark link</li>
            <li>Supply an optional email to receive the link</li>
          </ul>
        </div>

        <Heading level={3} anchor="how-long-submission">
          How long will my submission take to process? When can I expect my
          results?
        </Heading>

        <div>
          <p>
            Upon submission, a url link to retrieve the results will display.{" "}
            <b>
              The link provides job progress info and, once finished, the
              results.
            </b>
          </p>

          <p>Key factors of job duration:</p>

          <ul>
            <li>Number of sequences submitted</li>
            <li>Number of homologs to search for each sequence</li>
            <li>Length & complexity of sequences</li>
          </ul>
        </div>
      </Section>

      <Section className={classes.section}>
        <Heading level={2}>Behind MolEvolvR</Heading>

        <Heading level={3}>Data sources</Heading>

        <ul>
          <li>NCBI Taxonomy</li>
          <li>NCBI GenBank/RefSeq</li>
          <li>BLAST RefSeq</li>
          <li>NR DB</li>
          <li>InterPro</li>
        </ul>

        <Heading level={3}>Technologies</Heading>
        <div>
          <p>This platform is powered by MolEvolvR stack which consists of:</p>

          <ul>
            <li>
              <b>Frontend</b>: the frontend web app, written in React
            </li>

            <li>
              <b>Backend</b>: the backend written in{" "}
              <Link to="https://www.rplumber.io/index.html">Plumber</Link>
            </li>

            <li>
              <b>Cluster</b>: the containerized SLURM <code>cluster</code> on
              which jobs are run
            </li>

            <li>
              <b>Services</b>: a collection of services on which the stack
              relies
            </li>

            <li>
              <b>Postgres</b>: configuration for a PostgreSQL database, which
              stores job information Most of the data processing is accomplished
              via the{" "}
              <Link to="https://github.com/JRaviLab/molevolvr">
                MolEvolvR package.
              </Link>
            </li>
          </ul>

          <p>
            The stack simply provides a user-friendly interface for accepting
            and monitoring the progress of jobs, and orchestrates running the
            jobs on SLURM. The jobs themselves call methods of the package at
            each stage of processing.
          </p>
        </div>

        <Heading level={3}>Compatibility</Heading>
        <div>
          <p>This web-app is regularly tested on the following:</p>

          <ul>
            <li>Google Chrome, Mozilla Firefox, Apple Safari</li>
            <li>Windows, MacOS, iOS, Android</li>
            <li>Desktop, tablet, phone/mobile</li>
          </ul>

          <p>
            The following are NOT supported, and may result in unexpected look
            or behavior:
          </p>

          <ul>
            <li>Microsoft Internet Explorer.</li>
            <li>
              Smart watches, or any device with a screen width {"<"} ~250px.
            </li>
            <li>
              Browsers without JavaScript enabled (interactive features won’t
              work).
            </li>
          </ul>

          <p>
            If you encounter a bug, please{" "}
            <Link to="mailto:janani.ravi@cuanschutz.edu">let us know! </Link>
          </p>
        </div>

        <Heading level={3}>How to Cite</Heading>
        <blockquote>
          MolEvolvR: a web-app for characterizing proteins using molecular
          evolution and phylogeny. Jacob D Krol*, Joseph T Burke*, Samuel Z
          Chen*, Lo Sosinski*, Faisal S Alquaddoomi, Evan P Brenner, Ethan P
          Wolfe, Vince P Rubinetti, Shaddai Amolitos, Kellen M Reason, John B
          Johnston, Janani Ravi. [*Co-primary] bioRxiv 2022.02.18.461833;{" "}
          <p>
            doi:{" "}
            <Link to="https://doi.org/10.1101/2022.02.18.461833">
              https://doi.org/10.1101/2022.02.18.461833
            </Link>
          </p>
          <p>
            web-app:{" "}
            <span>
              <Link to="http://jravilab.org/molevolvr">
                http://jravilab.org/molevolvr
              </Link>
            </span>
          </p>
        </blockquote>

        <Heading level={3}>Team</Heading>

        <p>
          <ul>
            <li>
              Janani Ravi |{" "}
              <Link to="mailto:janani.ravi@cuanschutz.edu">Email</Link> |{" "}
              <Link to="https://github.com/jananiravi">GitHub</Link> |{" "}
              <Link to="https://mobile.twitter.com/janani137">X(Twitter)</Link>{" "}
              |{" "}
              <span>
                <b>(Corresponding author)</b>
              </span>
            </li>

            <li>
              Jacob D Krol |{" "}
              <Link to="mailto:jacob.krol@cuanschutz.edu">Email</Link> |{" "}
              <Link to="https://github.com/jakekrol">GitHub</Link>
            </li>

            <li>
              Joseph T Burke | <Link to="mailto:burkej24@msu.edu">Email</Link> |{" "}
              <Link to="https://github.com/jburke11">GitHub</Link> |{" "}
              <Link to="https://mobile.twitter.com/TBD">X(Twitter)</Link>
            </li>

            <li>
              Samuel Z Chen | <Link to="mailto:chensam2@msu.edu">Email</Link> |{" "}
              <Link to="https://github.com/samuelzornchen">GitHub</Link> |{" "}
              <Link to="https://mobile.twitter.com/SamuelZChen">
                X(Twitter)
              </Link>
            </li>

            <li>
              Lo Sosinski | <Link to="mailto:sosinsk7@msu.edu">Email</Link> |{" "}
              <Link to="https://github.com/lsosinski">GitHub</Link> |{" "}
              <Link to="https://mobile.twitter.com/lo_sosinski">
                X(Twitter)
              </Link>
            </li>

            <li>
              Faisal S Alquaddoom |{" "}
              <Link to="mailto:faisal.alquaddoomi@cuanschutz.edu">Email</Link> |{" "}
              <Link to="https://github.com/falquaddoomi">GitHub</Link>
            </li>

            <li>
              Evan P Brenner |{" "}
              <Link to="mailto:evan.brenner@cuanschutz.edu">Email</Link> |{" "}
              <Link to="https://github.com/epbrenner">GitHub</Link>
            </li>

            <li>
              Vince P Rubinett |{" "}
              <Link to="mailto:vincent.rubinetti@cuanschutz.edu">Email</Link> |{" "}
              <Link to="https://github.com/vincerubinetti">GitHub</Link>
            </li>

            <li>
              Shaddai Amolitos |{" "}
              <Link to="mailto:shaddai.amolitos@cuanschutz.edu">Email</Link>
            </li>

            <li>
              Kellen M Reason | <Link to="mailto:Kellen M Reason">Email</Link>
            </li>

            <li>
              John B Johnston | <Link to="mailto:johnj@msu.edu">Email</Link>
            </li>
          </ul>
        </p>
      </Section>

      <Section>
        <Heading level={2}>Getting Sequences</Heading>

        <Heading level={3} anchor="interproscan">
          From Iprscan5{" "}
          <span className="secondary">(for InterProScan analyses)</span>
        </Heading>

        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </p>

        <Heading level={3} anchor="blast">
          From NCBI BLAST{" "}
          <span className="secondary">(for BLAST analyses)</span>
        </Heading>

        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </p>
      </Section>

      <Section>
        <Heading level={2}>In-depth Info</Heading>

        <Heading level={3}>Format of protein sequences</Heading>

        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </p>

        <Heading level={3}>Accession numbers and FASTA</Heading>

        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </p>

        <Heading level={3}>Query heatmap missing lineages</Heading>

        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </p>
      </Section>

      <Section className={classes.section}>
        <Heading level={2}>Case studies</Heading>
        <div>
          <p>
            The computational methods underlying MolEvolvR have enabled
            understanding fundamental biological systems and protein evolution.
          </p>
          <p>
            In this section, companion MolEvolvR jobs for proteins studied in
            these publications are provided for users to explore.
          </p>
        </div>

        <Heading level={3}>
          Surface layer proteins in Gram-positive bacteria (Bacillota)s
        </Heading>
        <ul>
          <li>
            <Link to="https://doi.org/10.3389%2Ffmicb.2021.663468">
              Publication
            </Link>
          </li>
          <li>
            <Link to="https://jravilab.cuanschutz.edu/molevolvr/?r=slayer&p=resultsSummary">
              MolEvolvR results
            </Link>
          </li>
        </ul>

        <Heading level={3}>Helicase operators in bacteria</Heading>
        <ul>
          <li>
            <Link to="https://doi.org/10.1128/jb.00163-22">Publication</Link>
          </li>
          <li>
            <Link to="https://jravilab.cuanschutz.edu/molevolvr/?r=dciahe&p=resultsSummary">
              MolEvolvR results
            </Link>
          </li>
        </ul>

        <Heading level={3}>Novel internalin P homologs in Listeria</Heading>
        <ul>
          <li>
            <Link to="https://doi.org/10.1099/mgen.0.000828">Publication</Link>
          </li>
          <li>
            <Link to="https://jravilab.cuanschutz.edu/molevolvr/?r=liinlp&p=resultsSummary">
              MolEvolvR results
            </Link>
          </li>
        </ul>

        <Heading level={3}>Staphylococcus aureus sulfur acquisition</Heading>
        <ul>
          <li>
            <p>Glutathione import system</p>
            <ol>
              <Link to="https://doi.org/10.1371/journal.pgen.1010834">
                Publication
              </Link>
              <Link to="https://jravilab.cuanschutz.edu/molevolvr/?r=sasulf&p=resultsSummary">
                MolEvolvR results
              </Link>
            </ol>
          </li>
          <li>
            <p>Cystine transporters</p>
            <ol>
              <Link to="https://doi.org/10.1128/iai.00690-19">Publication</Link>
              <Link to="https://jravilab.cuanschutz.edu/molevolvr/?r=saabct&p=resultsSummary">
                MolEvolvR results
              </Link>
            </ol>
          </li>
          <li>
            <p>V. cholerae phage defense system</p>
            <ol>
              <Link to="https://doi.org/10.1038/s41564-022-01162-4">
                Publication
              </Link>
              <Link to="https://jravilab.cuanschutz.edu/molevolvr/?r=vcpdef&p=resultsSummary">
                MolEvolvR results
              </Link>
            </ol>
          </li>
        </ul>
      </Section>

      <Section>
        <Heading level={2}>Get to know us</Heading>

        <Heading level={3}>Funding</Heading>

        <p>
          We would like to thank our funding sources: Endowed Research Funds
          from the College of Veterinary Medicine, Michigan State University,
          NSF-funded BEACON funding support, and the University of Colorado
          Anschutz start-up funds awarded to JR; NSF-funded REU-ACRES summer
          scholarship to SZC; NIH NIAID U01AI176414 to JR; NIH NLM T15LM009451
          to EPB.
        </p>

        <Heading level={3}>More from JRaviLab</Heading>

        <ul>
          <li>
            <Link to="https://jravilab.github.io/">JRaviLab Website</Link>
          </li>
          <li>
            <Link to="https://twitter.com/jravilab">X(Twitter)</Link>
          </li>
          <li>
            <Link to="https://github.com/jravilab">GitHub</Link>
          </li>
        </ul>

        <Heading level={3}>Contact Us</Heading>

        <p>
          Questions? Email us at{" "}
          <span>
            <Link to="mailto:janani.ravi@cuanschutz.edu">
              janani.ravi@cuanschutz.edu.
            </Link>
          </span>
        </p>
      </Section>
    </>
  );
};

export default About;
