import {
  FaBook,
  FaCommentDots,
  FaDoorOpen,
  FaEnvelope,
  FaGithub,
  FaMicroscope,
  FaPenNib,
  FaTwitter,
  FaUsers,
} from "react-icons/fa6";
import Button from "@/components/Button";
import Flex from "@/components/Flex";
import Heading from "@/components/Heading";
import Link from "@/components/Link";
import Meta from "@/components/Meta";
import Section from "@/components/Section";
import { trim } from "@/util/string";

const team = [
  {
    name: "Janani Ravi (corresponding author)",
    email: "janani.ravi@cuanschutz.edu",
    github: "jananiravi",
    twitter: "janani137",
  },
  {
    name: "Jacob D Krol",
    email: "jacob.krol@cuanschutz.edu",
    github: "jakekrol",
  },
  {
    name: "Joseph T Burke",
    email: "burkej24@msu.edu",
    github: "jburke11",
  },
  {
    name: "Samuel Z Chen",
    email: "chensam2@msu.edu",
    github: "samuelzornchen",
    twitter: "SamuelZChen",
  },
  {
    name: "Lo Sosinski",
    email: "sosinsk7@msu.edu",
    github: "lsosinski",
    twitter: "lo_sosinski",
  },
  {
    name: "Faisal S Alquaddoomi",
    email: "faisal.alquaddoomi@cuanschutz.edu",
    github: "falquaddoomi",
  },
  {
    name: "Evan P Brenner",
    email: "evan.brenner@cuanschutz.edu",
    github: "epbrenner",
  },
  {
    name: "Vince P Rubinetti",
    email: "vincent.rubinetti@cuanschutz.edu",
    github: "vincerubinetti",
  },
  {
    name: "Shaddai Amolitos",
    email: "shaddai.amolitos@cuanschutz.edu",
  },
  {
    name: "Kellen M Reason",
    email: "reasonke@msu.edu",
  },
  {
    name: "John B Johnston",
    email: "johnj@msu.edu",
  },
];

const About = () => {
  return (
    <>
      <Meta title="About" />

      <Section>
        <Heading level={1} icon={<FaPenNib />}>
          About
        </Heading>
      </Section>

      <Section>
        <Heading level={2} icon={<FaCommentDots />}>
          FAQs
        </Heading>

        <Heading level={3}>
          How will I know when my analysis is done? Where are my past analyses?
        </Heading>

        <Flex direction="column" gap="sm" full>
          <p>
            When you submit an analysis, you'll be taken to a dedicated page for
            it where you can its status, and eventually, the results. You can
            bookmark this page or otherwise save its URL to view it later.
          </p>

          <p>
            You may also supply your email before submitting your analysis.
            We'll send you link to the analysis' page when its done.
          </p>

          <p>
            You can see the most recent analyses you submitted on your current
            device in the{" "}
            <Link to="load-analysis#history">history section</Link>.
          </p>
        </Flex>

        <Heading level={3}>When can I expect my results?</Heading>

        <Flex direction="column" gap="sm" full>
          <p>
            The time it takes to complete an analysis can be as little as a few
            minutes or as much as a few hours. It depends on many factors, such
            as:
          </p>

          <ul>
            <li>Number of sequences submitted</li>
            <li>Number of homologs to search for each sequence</li>
            <li>Length & complexity of sequences</li>
          </ul>

          <p>
            We try to provide helpful status information for monitoring
            analyses.
          </p>
        </Flex>

        <Heading level={3}>How do I upload protein sequences?</Heading>

        <Flex direction="column" gap="sm" full>
          <p>
            <strong>Protein sequence formats</strong> we support:
          </p>

          <ul>
            <li>
              <Link to="https://www.ncbi.nlm.nih.gov/genbank/fastaformat">
                NCBI FASTA
              </Link>

              <pre>
                <code>
                  {trim(
                    `>OHS91782.1 16S rRNA pseudouridine(516) synthase [Staphylococcus aureus]
                  MRIDKFLANMGVGTRNEVKQLLKKGLVNVNEQVIKSPKTHIEPENDKITVRGELIEYIENVYIMLNKPKG
                  YISATEDHHSKTVIDLIPEYQHLNIFPVGRLDKDTEGLLLITNDGDFNHELMSPNKHVSKKYEVISANPI
                  TEDDIQAFKEGVTLTDGKVKPAILTYIDNQTSHVTIYEGKYHQVKRMFHSIQNEVLHLRRIKIADLELDS
                  NLDSGEYRLLTENDFDKLNYK`,
                  )}
                </code>
              </pre>
            </li>

            <li>
              <Link to="https://www.uniprot.org/help/fasta-headers">
                UniProt FASTA
              </Link>

              <pre>
                {trim(
                  `>sp|P01189|COLI_HUMAN Pro-opiomelanocortin OS=Homo sapiens OX=9606 GN=POMC PE=1 SV=2
                MPRSCCSRSGALLLALLLQASMEVRGWCLESSQCQDLTTESNLLECIRACKPDLSAETPM
                FPGNGDEQPLTENPRKYVMGHFRWDRFGRRNSSSSGSSGAGQKREDVSAGEDCGPLPEGG
                PEPRSDGAKPGPREGKRSYSMEHFRWGKPVGKKRRPVKVYPNGAEDESAEAFPLEFKREL
                TGQRLREGDGPDGPADDGAGAQADLEHSLLVAAEKKDEGPYRMEHFRWGSPPKDKRYGGF
                MTSEKSQTPLVTLFKNAIIKNAYKKGE`,
                )}
              </pre>
            </li>

            <li>
              <span>Custom FASTA header (not recommended)</span>

              <pre>
                <code>
                  {trim(
                    `>SEQUENCE154 UNKNOWN 
                  MPRSCCSRSGALLLALLLQASMEVRGWCLESSQCQDLTTESNLLECIRACKPDLSAETPM
                  FPG`,
                  )}
                </code>
              </pre>
            </li>
          </ul>

          <p>
            We use NCBI or UniProt accessions to get taxonomy info from query
            proteins. Therefore, we recommend you include valid protein
            accession numbers in the header when possible.
          </p>

          <p>
            <strong>Common mistakes:</strong>
          </p>

          <ul>
            <li>
              <p>
                No header lines (missing <code>{">"}</code> header delimiter)
              </p>

              <pre>
                <code>
                  {trim(
                    `MRIDKFLANMGVGTRNEVKQLLKKGLVNVNEQVIKSPKTHIEPENDKITVRGELIEYIENVYIMLNKPKG

                  MPRSCCSRSGALLLALLLQASMEVRGWCLESSQCQDLTTESNLLECIRACKPDLSAETPM`,
                  )}
                </code>
              </pre>
            </li>

            <li>
              <p>Duplicate headers/accnums</p>

              <pre>
                <code>
                  {trim(
                    `>GCF_000013425.1
                  MVPEEKGSITLSKEAAIIFAIAKFKPFKNRIKNNPQKTNPFLKLHENKKS
                  >GCF_000013425.1
                  MKQKKSKNIFWVFSILAVVFLVLFSFAVGASNVPMMILTFILLVATFGIGFTTKKKYRENDWL
                  >protein
                  MKLTLMKFFVGGFAVLLSYIVSVTLPWKEFGGIFATFPAVFLVSMFITGMQYGDKVAVHVSRGAVFGMTGVLVCILVTWM
                  MLHMTHMWLISIVVGFLSWFISAVCIFEAVEFIAQKRLEKHSWKAGKSNSK
                  >protein
                  MVKRTYQPNKRKHSKVHGFRKRMSTKNGRKVLARRRRKGRKVLSA`,
                  )}
                </code>
              </pre>
            </li>
          </ul>
        </Flex>
      </Section>

      <Section>
        <Heading level={2} icon={<FaDoorOpen />}>
          Behind MolEvolvR
        </Heading>

        <Heading level={3}>Data sources</Heading>

        <ul>
          <li>NCBI Taxonomy</li>
          <li>NCBI GenBank/RefSeq</li>
          <li>BLAST RefSeq</li>
          <li>NR DB</li>
          <li>InterPro</li>
        </ul>

        <Heading level={3}>Technologies</Heading>

        <Flex direction="column" gap="sm" full>
          <p>
            MolEvolvR is a coordination of several different technologies,
            consisting of:
          </p>

          <ul>
            <li>
              <strong>
                <Link to="https://github.com/JRaviLab/molevolvr">
                  MolEvolvR package
                </Link>
              </strong>{" "}
              &ndash; the R package at the core of everything, which does most
              of the analysis calculations
            </li>
            <li>
              <strong>Frontend</strong> &ndash; a web app written in React
            </li>

            <li>
              <strong>Backend</strong> &ndash; a backend written in{" "}
              <Link to="https://www.rplumber.io/index.html">Plumber</Link>
            </li>

            <li>
              <strong>Cluster</strong> &ndash; a containerized SLURM cluster on
              which jobs are run
            </li>

            <li>
              <strong>Postgres</strong> &ndash; configuration for a database
              which stores job information
            </li>
          </ul>
        </Flex>

        <Heading level={3}>Compatibility</Heading>

        <Flex direction="column" gap="sm" full>
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
            <li>Internet Explorer</li>
            <li>
              Smart watches, or any device with a screen width {"<"} ~250px
            </li>
            <li>Browsers without JavaScript enabled</li>
          </ul>

          <p>
            If you encounter a bug, please{" "}
            <Link to="mailto:janani.ravi@cuanschutz.edu">let us know</Link>!
          </p>
        </Flex>
      </Section>

      <Section>
        <Heading level={2} icon={<FaBook />}>
          Case studies
        </Heading>

        <Flex direction="column" gap="sm" full>
          <p>
            The computational methods underlying MolEvolvR have enabled
            understanding fundamental biological systems and protein evolution.
          </p>

          <p>
            In this section, companion MolEvolvR jobs for proteins studied in
            these publications are provided for users to explore.
          </p>
        </Flex>

        <Flex direction="column" full>
          <Heading level={3}>
            Surface layer proteins in Gram-positive bacteria (Bacillota)
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
              <Link to="https://doi.org/10.1099/mgen.0.000828">
                Publication
              </Link>
            </li>

            <li>
              <Link to="https://jravilab.cuanschutz.edu/molevolvr/?r=liinlp&p=resultsSummary">
                MolEvolvR results
              </Link>
            </li>
          </ul>

          <Heading level={3}>Staphylococcus aureus sulfur acquisition</Heading>

          <Heading level={4}>Glutathione import system</Heading>

          <ul>
            <li>
              <Link to="https://doi.org/10.1371/journal.pgen.1010834">
                Publication
              </Link>
            </li>
            <li>
              <Link to="https://jravilab.cuanschutz.edu/molevolvr/?r=sasulf&p=resultsSummary">
                MolEvolvR results
              </Link>
            </li>
          </ul>

          <Heading level={4}>Cystine transporters</Heading>

          <ul>
            <li>
              <Link to="https://doi.org/10.1128/iai.00690-19">Publication</Link>
            </li>
            <li>
              <Link to="https://jravilab.cuanschutz.edu/molevolvr/?r=saabct&p=resultsSummary">
                MolEvolvR results
              </Link>
            </li>
          </ul>

          <Heading level={4}>V. cholerae phage defense system</Heading>

          <ul>
            <li>
              <Link to="https://doi.org/10.1038/s41564-022-01162-4">
                Publication
              </Link>
            </li>
            <li>
              {" "}
              <Link to="https://jravilab.cuanschutz.edu/molevolvr/?r=vcpdef&p=resultsSummary">
                MolEvolvR results
              </Link>
            </li>
          </ul>
        </Flex>
      </Section>

      <Section>
        <Heading level={2} icon={<FaUsers />}>
          Get to know us
        </Heading>

        <Heading level={3}>Team</Heading>

        <ul>
          {team.map(({ name, email, github, twitter }, index) => (
            <li key={index}>
              <Flex hAlign="left" gap="sm" gapRatio={0}>
                <span>{name}</span>
                {email && (
                  <Link to={`mailto:${email}`}>
                    <FaEnvelope />
                    {email}
                  </Link>
                )}
                {github && (
                  <Link to={`https://github.com/${github}`} showArrow={false}>
                    <FaGithub />@{github}
                  </Link>
                )}
                {twitter && (
                  <Link to={`https://twitter.com/${twitter}`} showArrow={false}>
                    <FaTwitter />@{twitter}
                  </Link>
                )}
              </Flex>
            </li>
          ))}
        </ul>

        <Heading level={3}>Funding</Heading>

        <p>
          We would like to thank our funding sources: Endowed Research Funds
          from the College of Veterinary Medicine, Michigan State University,
          NSF-funded BEACON funding support, and the University of Colorado
          Anschutz start-up funds awarded to JR; NSF-funded REU-ACRES summer
          scholarship to SZC; NIH NIAID U01AI176414 to JR; NIH NLM T15LM009451
          to EPB.
        </p>

        <Heading level={3}>Contact</Heading>

        <Flex hAlign="left" full>
          <Button
            to="mailto:janani.ravi@cuanschutz.edu"
            text="janani.ravi@cuanschutz.edu"
            icon={<FaEnvelope />}
          />
        </Flex>

        <Heading level={3}>Follow</Heading>

        <Flex hAlign="left" full>
          <Button
            to="https://jravilab.github.io/"
            text="JRaviLab"
            icon={<FaMicroscope />}
            tooltip="JRaviLab website"
          />
          <Button
            to="https://github.com/jravilab"
            text="GitHub"
            icon={<FaGithub />}
          />
          <Button
            to="https://twitter.com/jravilab"
            text="Twitter"
            icon={<FaTwitter />}
          />
        </Flex>
      </Section>
    </>
  );
};

export default About;
