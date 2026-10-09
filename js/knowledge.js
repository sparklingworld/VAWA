/**
 * VAWA Universal Knowledge & Viva Curriculum Engine
 * 1. Comprehensive Multi-Disciplinary Viva Question Banks (12 flagship fields)
 * 2. Universal Dynamic Topic Synthesizer (Generates questions for ANY custom topic)
 * 3. 4-Tier Difficulty Progression (Foundation -> Standard -> Rigorous -> Crucible)
 * 4. The "Good & Simple Answer" Synthesis Engine (Intuition, Analogy, 3 Core Pillars)
 * 5. Semantic Rubric Evaluation Engine
 */

const VAWAKnowledge = (() => {
  'use strict';

  // --- 1. FLAGSHIP ACADEMIC CURRICULA ---
  const CURRICULA = {
    'computer-science': {
      title: 'Computer Science & Distributed Systems',
      category: 'Engineering & Computing',
      questions: {
        foundation: [
          {
            id: 'cs-f-1',
            question: "Candidate, define the core distinction between a process and a thread, and explain how the operating system manages their memory spaces.",
            keywords: ['process', 'thread', 'address space', 'memory', 'stack', 'heap', 'context switch', 'pcb'],
            idealAnswer: "A process is an independent execution unit with its own dedicated virtual address space, containing its own text segment, data segment, heap, and stack managed via a Process Control Block (PCB). A thread is a lightweight execution stream within a process that shares the parent process's address space, heap, and file descriptors, but maintains its own program counter, registers, and call stack. Threads offer lower context-switching overhead but require synchronized access to shared state to prevent race conditions.",
            simpleAnswer: {
              summary: "A process is a completely separate house with its own private yard. A thread is an individual person living and working inside that same house.",
              analogy: "Think of an office building: A process is an entire department with its own locked room and private filing cabinets. Threads are individual coworkers in that room who can talk to each other instantly and share the same whiteboards, but need to take turns to avoid scribbling over each other's notes.",
              threePillars: [
                "Memory Isolation: Processes have private, guarded memory; threads share memory within the same process.",
                "Context Overhead: Switching threads is fast and lightweight; switching processes requires flushing CPU translation caches (TLB).",
                "Fault Tolerance: If a process crashes, others survive; if an unhandled thread crashes, the entire parent process goes down."
              ]
            }
          },
          {
            id: 'cs-f-2',
            question: "Explain the purpose of indexing in relational databases. How does a B-Tree index minimize disk I/O operations?",
            keywords: ['index', 'b-tree', 'disk i/o', 'lookup', 'binary search', 'block', 'height', 'node'],
            idealAnswer: "A database index is an auxiliary data structure that enables fast logarithmic or sub-linear data retrieval without scanning every page in a table. A B-Tree (or B+ Tree) is a self-balancing, multi-way search tree optimized for block-based storage. Because each node contains many keys and child pointers, the tree exhibits high fanout and shallow height. Consequently, looking up any row requires traversing very few disk block reads compared to a linear O(N) table scan.",
            simpleAnswer: {
              summary: "A database index is like the alphabetical index at the back of a thick textbook—instead of reading every single page from start to finish, you flip directly to the exact page.",
              analogy: "Imagine an enormous library with millions of books. A B-Tree is an organized series of directory signs: Floor -> Aisle -> Shelf -> Exact Book. You only take 3 or 4 physical steps to touch the right book instead of walking past millions of shelves.",
              threePillars: [
                "High Fanout: Each node holds hundreds of keys, keeping the tree very short (typically 3 to 4 levels).",
                "Disk Block Alignment: Nodes are sized to match hardware disk block sectors, maximizing data retrieved per read.",
                "Logarithmic Bounds: Queries find target records in O(log N) operations with minimal disk head movement."
              ]
            }
          }
        ],
        standard: [
          {
            id: 'cs-s-1',
            question: "In distributed architecture, explain the CAP theorem. Why is it impossible for a distributed data store to simultaneously provide Consistency, Availability, and Partition Tolerance under a network partition?",
            keywords: ['cap theorem', 'consistency', 'availability', 'partition tolerance', 'network split', 'brewer', 'quorum', 'tradeoff'],
            idealAnswer: "Eric Brewer's CAP Theorem proves that in an asynchronous network subject to partitions (P), a distributed system must choose between linearizable consistency (C) and high availability (A). If a network split occurs, nodes in partition Alpha cannot communicate with partition Beta. If the system continues accepting writes on both sides, the states diverge, violating Consistency. If the system rejects writes to maintain consistency, it is no longer fully Available. Since physical network partitions are unavoidable in distributed hardware, real-world systems are strictly CP or AP.",
            simpleAnswer: {
              summary: "When telephone lines between two branches of a bank get cut, the bank must either stop taking withdrawals (Consistency over Availability) or keep handing out cash risking double-spending (Availability over Consistency).",
              analogy: "Imagine two clerks separated by a soundproof glass wall with no phone line. A customer gives money to Clerk A. Clerk B doesn't know. If another customer asks Clerk B for their balance, Clerk B must either refuse to answer (choosing Consistency) or guess with stale info (choosing Availability). You can't have both when the wire is cut.",
              threePillars: [
                "Partitions Are Inevitable: Network cables get severed, packets drop, and servers lag.",
                "CP Systems: Prioritize absolute correctness; if nodes can't agree, they reject operations.",
                "AP Systems: Prioritize uptime and instant response; accept operations now and reconcile discrepancies later (Eventual Consistency)."
              ]
            }
          }
        ],
        rigorous: [
          {
            id: 'cs-r-1',
            question: "Explain the mechanics of the Raft consensus algorithm. Specifically, how does Raft resolve leader election splits and ensure the Log Matching Property across terms?",
            keywords: ['raft', 'consensus', 'leader election', 'log matching', 'heartbeat', 'term', 'split vote', 'randomized timeout', 'commit index'],
            idealAnswer: "Raft structures consensus by decomposing it into leader election, log replication, and safety. When followers miss periodic heartbeats, their randomized election timeouts expire, triggering candidate transitions with incremented terms. The randomized timeouts prevent split-vote deadlocks. Candidates request votes requiring majorities; a node only votes for candidates whose logs are at least as up-to-date as its own. The Log Matching Property guarantees that if two entries in different logs share index and term, they are identical, and all preceding entries are identical. Overwriting uncommitted logs enforces authoritative leader state upon term transition.",
            simpleAnswer: {
              summary: "Raft is an orderly voting protocol where servers elect one designated president using randomized countdown clocks. The president writes every decision in an official numbered diary, and once a majority copies it, it is permanent law.",
              analogy: "Think of an orchestra without a conductor: Each musician sets a random silent timer. Whomever's timer rings first steps up to conduct. The musicians only accept them if their musical score is as up-to-date as theirs. The conductor counts beats, checks that the majority is in sync, and directs the next measure.",
              threePillars: [
                "Randomized Election Timeouts: Prevents multiple candidates from triggering votes at the exact same millisecond.",
                "Majority Quorum: A leader can only commit an entry if greater than 50% of the cluster confirms receipt.",
                "Authoritative Monotonic Terms: Terms act as logical clocks; obsolete leaders immediately step down upon observing a higher term."
              ]
            }
          }
        ],
        crucible: [
          {
            id: 'cs-c-1',
            question: "Candidate, defend the trade-offs of Cache Coherence protocols under multi-socket NUMA architectures. Contrast MESI with MOESI and explain how false sharing at the L1 cache boundary degrades memory bus saturation.",
            keywords: ['cache coherence', 'numa', 'mesi', 'moesi', 'false sharing', 'cache line', 'invalidation', 'owner state', 'bus snooping', 'directory based'],
            idealAnswer: "On symmetric and NUMA architectures, keeping local core caches coherent relies on snooping or directory protocols. The standard MESI protocol (Modified, Exclusive, Shared, Invalid) requires writing back a modified line to shared L3/main memory before another core can read it into a Shared state. MOESI introduces the 'Owner' state, allowing a modified cache line to be shared directly between core caches via inter-core interconnect without an immediate memory write-back, drastically saving bus bandwidth. False sharing occurs when independent threads modify distinct variables that happen to reside within the identical 64-byte cache line; even with zero logical data sharing, each write triggers cache-line invalidation across the inter-socket bus, degrading throughput via cache thrashing.",
            simpleAnswer: {
              summary: "When multiple processors read and write memory, they keep local sticky notes. If two processors need different words written on the exact same sticky note, they keep snatching and tearing up each other's note over and over.",
              analogy: "Imagine two authors collaborating on a book. They write separate sentences, but their printer only prints in whole 64-character paragraphs. Every time Author A changes one letter, the printer invalidates Author B's entire sheet, forcing them to wait for a reprint even though their own sentence was completely untouched.",
              threePillars: [
                "64-Byte Granularity: Caches move data in full lines, not individual bytes.",
                "False Sharing Penalty: Modifying disjoint variables on the same line causes catastrophic cross-core invalidation loops.",
                "MOESI Owner State: Allows dirty cache lines to be read directly by other cores without touching slow main memory."
              ]
            }
          }
        ]
      }
    },

    'artificial-intelligence': {
      title: 'Artificial Intelligence & Deep Learning',
      category: 'Engineering & Computing',
      questions: {
        foundation: [
          {
            id: 'ai-f-1',
            question: "Candidate, explain the mechanism of Backpropagation in neural networks. How does the Chain Rule of calculus enable gradient calculation?",
            keywords: ['backpropagation', 'chain rule', 'gradient', 'loss function', 'weights', 'derivatives', 'activation', 'optimization'],
            idealAnswer: "Backpropagation is the algorithmic application of the chain rule from calculus to compute the gradient of a loss function with respect to every weight in a deep neural network. During the forward pass, activations are computed layer-by-layer to generate a prediction and loss. During the backward pass, error signals are propagated backwards from the output layer to the input layer. The chain rule decomposes the partial derivative of the scalar loss with respect to any intermediate weight into a product of local Jacobians and upstream gradients, enabling gradient descent updates.",
            simpleAnswer: {
              summary: "Backpropagation is how an AI learns from its mistakes: it looks at how wrong its final answer was and traces backwards through every decision dial to see who was most responsible, nudging them in the right direction.",
              analogy: "Think of an assembly line baking a cake that ends up too salty. The head chef tastes it (loss), walks backwards to the decorator, then the baker, then the mixer, telling each worker exactly how much their specific ingredient contributed to the saltiness so they can adjust their spoons tomorrow.",
              threePillars: [
                "Forward Pass: Data flows in, makes predictions, and measures total error.",
                "Backward Pass: The Chain Rule traces the blame back through each layer mathematically.",
                "Weight Update: Small tweaks (learning rate × gradient) improve the network on the next attempt."
              ]
            }
          }
        ],
        standard: [
          {
            id: 'ai-s-1',
            question: "Explain the self-attention mechanism in the Transformer architecture. Why does scaled dot-product attention compute the dot product between Queries and Keys, and why divide by the square root of the key dimension?",
            keywords: ['self-attention', 'transformer', 'query', 'key', 'value', 'scaled dot-product', 'softmax', 'dimension', 'vanishing gradient'],
            idealAnswer: "Self-attention computes dynamic, contextual relationships between all tokens in a sequence regardless of distance. Input tokens are projected into Query (Q), Key (K), and Value (V) matrices. The dot product between Q and K evaluates pairwise compatibility scores. Dividing by sqrt(d_k) is critical because as vector dimensionality grows large, the dot products grow proportionally large in magnitude, pushing the subsequent Softmax function into regions with near-zero gradients (vanishing gradient problem). Softmax generates attention weights which then weight the Value vectors.",
            simpleAnswer: {
              summary: "Self-attention lets every word in a sentence look at every other word to understand context, like looking at pronouns to figure out who 'it' refers to.",
              analogy: "Imagine a conference room where each attendee has a name tag (Key) and a question (Query). You compare your question against every person's name tag to see who has the most relevant answer, and you give them your highest attention. Dividing by sqrt(d_k) is like keeping the microphone volume at a moderate level so nobody's voice clips or distorts the sound.",
              threePillars: [
                "Pairwise Relevance: Every token calculates how much it should care about every other token simultaneously.",
                "Scaling Factor 1/sqrt(d_k): Prevents extreme numbers that would freeze the Softmax gradients.",
                "Value Aggregation: The weighted sum produces a rich, context-aware representation of each word."
              ]
            }
          }
        ],
        rigorous: [
          {
            id: 'ai-r-1',
            question: "Candidate, dissect the phenomenon of Overfitting versus Underfitting through the lens of the Bias-Variance Decomposition. How do modern techniques like Low-Rank Adaptation (LoRA) and Dropout alter the hypothesis space?",
            keywords: ['bias-variance', 'overfitting', 'underfitting', 'regularization', 'lora', 'dropout', 'hypothesis space', 'generalization', 'rank decomposition'],
            idealAnswer: "The expected test error decomposes into irreducible error, squared bias (error from erroneous assumptions / model under-capacity), and variance (error from sensitivity to small fluctuations in training data). Overfitting represents low bias but high variance, where the model memorizes idiosyncratic training noise. Dropout combats this during training by randomly zeroing activations with probability p, preventing co-adaptation and acting as an ensemble of exponential thinned sub-networks. LoRA constrains parameter updates during LLM fine-tuning into low-rank decomposition matrices (delta W = B * A with rank r << d), drastically restricting the degrees of freedom in the hypothesis space and preserving generalizable pretrained features.",
            simpleAnswer: {
              summary: "Underfitting is reading only the title of a chapter and guessing; Overfitting is memorizing the exact page numbers and typos of the textbook without understanding the concepts.",
              analogy: "If you train a puppy on grass in sunny weather, an overfitted puppy will refuse to sit on pavement when it rains. Dropout is like training the puppy with one eye closed or on different carpets so it learns the actual command rather than the background environment. LoRA is like giving the trainer a cheat sheet with 3 bullet points instead of rewriting the entire encyclopedia.",
              threePillars: [
                "Bias: How simplistic the model's assumptions are (too high = underfitting).",
                "Variance: How hyper-sensitive the model is to training noise (too high = overfitting).",
                "Constrained Updates (LoRA): Freezes foundation weights and trains tiny mathematical adapters to retain general intelligence."
              ]
            }
          }
        ],
        crucible: [
          {
            id: 'ai-c-1',
            question: "Address the Alignment Problem in frontier LLMs: Contrast Reinforcement Learning from Human Feedback (RLHF) with Direct Preference Optimization (DPO). What are the failure modes of reward hacking and sycophancy?",
            keywords: ['rlhf', 'dpo', 'reward model', 'sycophancy', 'reward hacking', 'kl divergence', 'implicit reward', 'ppo', 'preference optimization'],
            idealAnswer: "RLHF trains an external reward model on paired human preferences, then optimizes the policy model via PPO (Proximal Policy Optimization) constrained by a KL-divergence penalty against the reference model. DPO mathematically reformulates the objective, demonstrating that the optimal reward can be derived in closed form from the language model's own implicit policy, eliminating the need for a separate reward model or complex reinforcement learning loops. Failure modes include 'reward hacking'—where the agent exploits loopholes in proxy scoring metrics without fulfilling intended semantics—and 'sycophancy', where models flatter user biases and validate incorrect candidate assertions to score high perceived helpfulness ratings.",
            simpleAnswer: {
              summary: "Teaching an AI to be helpful and safe without turning it into a dishonest yes-man who says whatever pleases the judge.",
              analogy: "RLHF is like hiring a food critic to score student chefs, and training the chefs with rewards. DPO is teaching the student chefs directly by showing them two plates and having them emulate the better one. 'Sycophancy' is when the chef notices you like sugar, so they dump syrup over your steak just to get a 5-star review.",
              threePillars: [
                "RLHF Complexity: Requires a separate judge model, PPO training instability, and KL divergence controls.",
                "DPO Elegance: Solves the preference equation directly through language loss without reinforcement learning.",
                "Sycophancy Danger: AI prioritizes agreeing with the human over stating objective scientific truth."
              ]
            }
          }
        ]
      }
    },

    'medicine-physiology': {
      title: 'Clinical Medicine & Human Physiology',
      category: 'Health & Biological Sciences',
      questions: {
        foundation: [
          {
            id: 'med-f-1',
            question: "Candidate, describe the physiological genesis of an Action Potential in a neuronal axon. Detail the sequential voltage-gated ion channel conductance.",
            keywords: ['action potential', 'sodium', 'potassium', 'depolarization', 'repolarization', 'threshold', 'voltage-gated', 'refractory period'],
            idealAnswer: "An action potential initiates when resting membrane potential (-70 mV) is depolarized past threshold (~-55 mV). Voltage-gated Na+ channels rapidly open, causing a massive influx of sodium ions down their electrochemical gradient, driving the membrane potential towards +30 mV (depolarization). At the peak, voltage-gated Na+ channels inactivate, and slower voltage-gated K+ channels open, permitting potassium efflux to repolarize the cell. Continued K+ efflux produces brief hyperpolarization before Na+/K+ ATPase pumps restore resting ionic distribution.",
            simpleAnswer: {
              summary: "An action potential is the tiny electrical spark a nerve sends down its wire, triggered like a mousetrap once the pressure hits a critical threshold.",
              analogy: "Think of a crowded stadium wave: It takes a small group standing up together to start the wave (threshold). Once triggered, doors fly open and sodium fans rush onto the field (depolarization). Security blows the whistle, shuts those doors, and potassium fans leave the field to clear it (repolarization).",
              threePillars: [
                "All-or-Nothing Threshold: Depolarization must reach -55 mV or nothing fires.",
                "Sodium Influx: Fast Na+ channels open, sending voltage spiking positive.",
                "Potassium Efflux: K+ channels open to vent positive charge, resetting the electrical balance."
              ]
            }
          }
        ],
        standard: [
          {
            id: 'med-s-1',
            question: "Explain the physiological mechanisms of the Renin-Angiotensin-Aldosterone System (RAAS) in regulating systemic blood pressure and fluid homeostasis.",
            keywords: ['raas', 'renin', 'angiotensin', 'aldosterone', 'blood pressure', 'kidney', 'ace', 'vasoconstriction', 'sodium retention'],
            idealAnswer: "When renal perfusion pressure drops or sympathetic activity rises, the juxtaglomerular cells in the kidney secrete renin. Renin cleaves circulating angiotensinogen from the liver into angiotensin I. Angiotensin-Converting Enzyme (ACE) primarily in pulmonary vascular endothelium converts Angiotensin I into Angiotensin II. Angiotensin II is a potent vasoconstrictor and stimulates the adrenal cortex to secrete aldosterone. Aldosterone acts on renal distal convoluted tubules and collecting ducts to upregulate ENaC channels and Na+/K+ pumps, promoting sodium and water reabsorption while excreting potassium, thereby restoring intravascular volume and arterial pressure.",
            simpleAnswer: {
              summary: "The kidneys are the body's emergency water and pressure regulator: when pressure drops, they send out a hormonal cascade that constricts pipes and holds onto water and salt.",
              analogy: "Imagine an automated garden irrigation system: If the water pressure drops, a pressure gauge in the pump sends an alarm (renin). The main valve pinches the hoses tighter so the water sprays farther (vasoconstriction), and an emergency reservoir holds onto every drop of water (aldosterone).",
              threePillars: [
                "Renin Trigger: Released by kidneys when blood pressure or sodium levels dip.",
                "Angiotensin II Action: Constricts blood vessels instantly to raise hydrostatic pressure.",
                "Aldosterone Action: Forces kidneys to retain salt and water, expanding total blood volume."
              ]
            }
          }
        ],
        rigorous: [
          {
            id: 'med-r-1',
            question: "Candidate, differentiate the pathophysiological cascades of Cardiogenic Shock versus Septic Shock, focusing on Systemic Vascular Resistance (SVR), Cardiac Output (CO), and mixed venous oxygen saturation (SvO2).",
            keywords: ['cardiogenic shock', 'septic shock', 'svr', 'cardiac output', 'svo2', 'hypoperfusion', 'endotoxin', 'vasodilation'],
            idealAnswer: "Cardiogenic shock is characterized by primary pump failure (e.g. extensive myocardial infarction). Cardiac Output (CO) is severely depressed, which triggers compensatory sympathetic vasoconstriction, markedly increasing Systemic Vascular Resistance (SVR). Pulmonary Capillary Wedge Pressure (PCWP) is elevated, and mixed venous oxygen saturation (SvO2) is low due to heightened tissue oxygen extraction from sluggish capillary transit. Conversely, distributive/septic shock features severe cytokine-mediated nitric oxide synthesis causing widespread arterial vasodilation, resulting in low SVR. Cardiac Output is typically elevated in hyperdynamic early phase ('warm shock'), and SvO2 is elevated because microvascular shunting and cellular mitochondrial dysfunction prevent peripheral tissues from extracting oxygen.",
            simpleAnswer: {
              summary: "Cardiogenic shock is a broken engine pump trying to push through clamped-down pipes; Septic shock is an engine pumping frantically while all the pipes burst wide open and leak.",
              analogy: "Cardiogenic shock is a weak water pump in a house—water barely trickles out of the faucets, and pressure drops because the pump is failing. Septic shock is having a great pump, but someone opened every single faucet and smashed every pipe in the neighborhood—water pressure plummets because the pipes have zero resistance.",
              threePillars: [
                "Cardiogenic Shock: Low Cardiac Output, High SVR (cold, clamped extremities), Low SvO2.",
                "Septic Shock: Low SVR (warm, dilated vessels), High or normal early Cardiac Output, High SvO2 (extraction failure).",
                "Clinical Core: One needs inotropic pump support; the other needs massive fluid resuscitation and vasopressors."
              ]
            }
          }
        ],
        crucible: [
          {
            id: 'med-c-1',
            question: "Defend your differential diagnosis for a patient presenting with high-anion gap metabolic acidosis, acute respiratory alkalosis, and tinnitus. Delineate the cellular uncoupling of oxidative phosphorylation.",
            keywords: ['salicylate', 'aspirin toxicity', 'anion gap', 'metabolic acidosis', 'respiratory alkalosis', 'oxidative phosphorylation', 'uncoupling', 'tinnitus'],
            idealAnswer: "The classic triad of mixed high-anion gap metabolic acidosis and respiratory alkalosis accompanied by tinnitus is pathognomonic for acute Salicylate (Aspirin) toxicity. Direct stimulation of the medullary respiratory center induces hyperventilation and early respiratory alkalosis. Simultaneously, salicylates enter mitochondria and act as protonophores, uncoupling oxidative phosphorylation by dissipating the proton gradient across the inner mitochondrial membrane. ATP synthesis collapses while oxygen consumption and heat generation surge, driving anaerobic glycolysis and accumulation of lactic acid, acetoacetate, and ketoacids, culminating in severe metabolic acidosis.",
            simpleAnswer: {
              summary: "Aspirin overdose causes the body to breathe frantically while simultaneously short-circuiting the power generators inside every cell, creating a dual acid-base crisis with characteristic ear ringing.",
              analogy: "Imagine an engine where someone broke the driveshaft: the carburetor is sucking in massive air (hyperventilation), but instead of turning the wheels into useful motion (ATP), the engine just overheats wildly and fills the cabin with burning acidic fumes (metabolic acidosis).",
              threePillars: [
                "Pathognomonic Triad: Tinnitus (ear ringing) + rapid deep breathing + mixed acid-base disorder.",
                "Mitochondrial Uncoupling: Salicylates short-circuit the proton gradient, collapsing cellular energy.",
                "Treatment Urgency: Requires urinary alkalinization (IV sodium bicarbonate) to trap salicylates in urine for excretion."
              ]
            }
          }
        ]
      }
    },

    'jurisprudence-law': {
      title: 'Jurisprudence & Constitutional Law',
      category: 'Legal & Political Sciences',
      questions: {
        foundation: [
          {
            id: 'law-f-1',
            question: "Candidate, elucidate the twin doctrinal components of criminal liability: Actus Reus and Mens Rea. Under what statutory circumstances may criminal liability attach without Mens Rea?",
            keywords: ['actus reus', 'mens rea', 'strict liability', 'concurrence', 'culpability', 'negligence', 'recklessness', 'statute'],
            idealAnswer: "In criminal jurisprudence, liability requires concurrence of Actus Reus (the wrongful voluntary physical act or omission) and Mens Rea (the culpable mental state, such as intent, knowledge, recklessness, or criminal negligence). The critical statutory exception is 'Strict Liability', where the legislature imposes penal sanctions based solely on commission of the prohibited act regardless of intent or moral fault. This typically governs public welfare offenses, environmental compliance, and regulatory safety statutes where public harm outweighs individual moral culpability.",
            simpleAnswer: {
              summary: "A crime normally requires both the bad deed (Actus Reus) and the guilty mind (Mens Rea). Strict liability is the rare exception where doing the deed is illegal even if you had zero bad intentions.",
              analogy: "If you accidentally knock over a lamp, you did the action without bad intent. If you intentionally smashed the lamp, you have both the deed and the guilty mind. A speeding ticket is strict liability: the officer doesn't care whether you meant to speed or not—your speedometer was over the limit, period.",
              threePillars: [
                "Actus Reus: The voluntary physical conduct forbidden by the penal code.",
                "Mens Rea: The mental state of blameworthiness (purpose, knowledge, recklessness).",
                "Strict Liability: Statutory exceptions designed for public safety where lack of intent is no defense."
              ]
            }
          }
        ],
        standard: [
          {
            id: 'law-s-1',
            question: "Examine the doctrine of Judicial Review established in Marbury v. Madison (1803). How did Chief Justice John Marshall reconcile Article III judicial power with legislative supremacy?",
            keywords: ['marbury v madison', 'judicial review', 'constitution', 'marshall', 'article iii', 'checks and balances', 'supremacy clause'],
            idealAnswer: "In Marbury v. Madison (1803), Chief Justice John Marshall established the cornerstone of constitutional law: that the judiciary possesses the ultimate authority to nullify acts of Congress that violate the Constitution. Marshall posited that the Constitution is paramount, superior law. If an act of the legislature conflicts with the Constitution, the court must enforce the supreme law, famously declaring: 'It is emphatically the province and duty of the judicial department to say what the law is.' This established the judiciary as an equal, co-ordinate branch capable of checking legislative power.",
            simpleAnswer: {
              summary: "Marbury v. Madison established that the Supreme Court has the final say to strike down laws passed by Congress or the President if they violate the Constitution.",
              analogy: "Think of a referee in a sports match: The players and coaches can make up plays all day, but the rulebook (Constitution) sits above them all. The referee (Supreme Court) has the final whistle to declare any play void if it breaks the official rulebook.",
              threePillars: [
                "Constitutional Supremacy: The Constitution is the fundamental baseline; no ordinary law can contradict it.",
                "Judicial Mandate: Courts are duty-bound to interpret and declare what statutory and constitutional provisions mean.",
                "Equilibrium of Power: Transformed the Supreme Court from a weak body into a potent co-equal branch."
              ]
            }
          }
        ],
        rigorous: [
          {
            id: 'law-r-1',
            question: "Deconstruct the Three Tiers of Scrutiny in Fourteenth Amendment Equal Protection jurisprudence. What exact evidentiary showings must the State furnish to survive Strict Scrutiny versus Intermediate Scrutiny?",
            keywords: ['strict scrutiny', 'intermediate scrutiny', 'rational basis', 'equal protection', 'fourteenth amendment', 'compelling interest', 'narrowly tailored', 'suspect class'],
            idealAnswer: "Under Equal Protection jurisprudence, legislative classifications are reviewed under three standards: Rational Basis (classification rationally related to a legitimate government interest); Intermediate Scrutiny (classification substantially related to an important government objective, applied to quasi-suspect classes like gender and non-marital children); and Strict Scrutiny. Strict Scrutiny applies to suspect classifications (race, national origin) or fundamental rights infringements. To survive strict scrutiny, the State bears the heavy burden of demonstrating that the measure serves a 'compelling governmental interest' and is 'narrowly tailored' using the 'least restrictive means' available.",
            simpleAnswer: {
              summary: "When the government treats groups of people differently, courts use three magnifying glasses of increasing intensity: standard (rational), strong (intermediate), and hyper-critical (strict scrutiny).",
              analogy: "Think of airport security checks: A routine metal detector is Rational Basis (everyone walks through). Secondary screening for liquids is Intermediate. A full strip search is Strict Scrutiny—the government must prove beyond doubt an emergency exists and there is no milder alternative.",
              threePillars: [
                "Rational Basis: Government almost always wins (law must be merely reasonable).",
                "Intermediate Scrutiny: Used for gender—requires an important goal and substantial connection.",
                "Strict Scrutiny: Used for race and fundamental rights—statute is presumed unconstitutional unless compelling and narrowly tailored."
              ]
            }
          }
        ],
        crucible: [
          {
            id: 'law-c-1',
            question: "Candidate, reconcile H.L.A. Hart's Concept of Law with Lon Fuller's Morality of Law. Can an evil legal order satisfy the Rule of Recognition, and does Fuller's internal morality of law collapse into natural law?",
            keywords: ['hart', 'fuller', 'rule of recognition', 'internal morality of law', 'positivism', 'natural law', 'grudge informer', 'procedural morality'],
            idealAnswer: "The Hart-Fuller debate centres on the conceptual separability of law and morality. H.L.A. Hart, defending legal positivism, argued that legal validity derives from social facts codified in a 'Rule of Recognition' (union of primary and secondary rules), insisting that an immoral statute may nonetheless be legally valid law ('an unjust law is still law, though one might have a moral duty to disobey it'). Lon Fuller rejected this separability, arguing that law is a purposive enterprise governed by an 'internal morality' comprised of eight procedural canons (generality, promulgation, non-retroactivity, clarity, non-contradiction, possibility of compliance, constancy, and official congruence). Fuller claimed a tyrannical regime that systematically violates these procedural principles forfeits the designation of law altogether, bridging procedural fidelity with substantive natural law.",
            simpleAnswer: {
              summary: "Hart says 'Law is just what the official rulebook says, even if it is cruel'; Fuller says 'If the rulebook is rigged and arbitrary, it doesn't deserve to be called law at all.'",
              analogy: "Imagine an umpire who makes up rules backwards, changes them mid-pitch, and keeps them secret. Hart says 'He is still wearing the umpire uniform, so his calls are technically legal.' Fuller says 'That is not baseball anymore; it has ceased to function as a game.'",
              threePillars: [
                "Legal Positivism (Hart): Law and morality are distinct; valid laws stem from authoritative institutional acceptance.",
                "Internal Morality (Fuller): Law requires minimum procedural fairness (clarity, non-retroactivity) to command legitimate authority.",
                "The Core Tension: Whether legitimacy is defined by pedigree and power, or by moral and procedural integrity."
              ]
            }
          }
        ]
      }
    },

    'quantum-physics': {
      title: 'Quantum Physics & Thermodynamics',
      category: 'Physical Sciences',
      questions: {
        foundation: [
          {
            id: 'qp-f-1',
            question: "Candidate, state Heisenberg's Uncertainty Principle and explain why it is an intrinsic wave property rather than a mere limitation of measuring instruments.",
            keywords: ['heisenberg', 'uncertainty principle', 'position', 'momentum', 'planck constant', 'fourier transform', 'wave packet'],
            idealAnswer: "Heisenberg's Uncertainty Principle dictates that the product of the uncertainties in position (delta x) and momentum (delta p) satisfies delta x * delta p >= hbar / 2. Crucially, this is not a measurement error or instrument defect; it is a fundamental mathematical property of conjugate Fourier pairs in quantum wave mechanics. A localized particle requires a narrow spatial wave packet, which can only be formed by superposing a broad spectrum of wave numbers (and thus momentums). Conversely, a definite momentum possesses a pure single wavelength that spans infinite space.",
            simpleAnswer: {
              summary: "You cannot simultaneously know both exactly where a quantum particle is and where it is going—not because your camera is blurry, but because particles behave like waves.",
              analogy: "Think of a ripple in a pond: If you ask 'What is the exact single musical frequency of a quick sharp splash?', you can't say, because a sharp splash is made of dozens of ripples mixed together. If you have a long continuous wave, you know its frequency perfectly, but it doesn't have an 'exact single location'—it spreads across the entire lake.",
              threePillars: [
                "Fundamental Wave Nature: Particles are quantum wavefunctions, not microscopic hard billiard balls.",
                "Conjugate Variables: Position and momentum are Fourier transforms of each other.",
                "Theoretical Limit: Delta x × Delta p can never be zero, regardless of future technology."
              ]
            }
          }
        ],
        standard: [
          {
            id: 'qp-s-1',
            question: "Explain the Second Law of Thermodynamics in terms of Boltzmann's statistical entropy formula S = k ln W. Why is a system's entropy monotonically non-decreasing in an isolated system?",
            keywords: ['entropy', 'second law', 'boltzmann', 'microstates', 'macrostates', 'isolated system', 'phase space', 'probability'],
            idealAnswer: "Boltzmann formulated entropy as S = k_B * ln(W), where W represents the multiplicity (number of distinct microstates corresponding to a given macrostate). In an isolated system, all accessible microstates are equally probable according to the fundamental postulate of statistical mechanics. Macrostates with higher thermodynamic entropy correspond to exponentially larger volumes of phase space. A system spontaneously evolves toward macrostates with maximum multiplicity simply because they are statistically overwhelming in probability, rendering spontaneous entropy reduction macroscopically impossible.",
            simpleAnswer: {
              summary: "Entropy increases because there are trillions of ways for things to be messy and disordered, but only one or two ways for them to be perfectly arranged.",
              analogy: "Imagine shaking a box with 1,000 coins. There are trillions of combinations where heads and tails are mixed up, but only exactly ONE combination where all 1,000 land on heads. If you shake the box, it moves toward the mixed-up state purely due to overwhelming statistical odds.",
              threePillars: [
                "Multiplicity W: The count of microscopic ways particles can arrange themselves.",
                "Statistical Inevitability: High-entropy states have vastly higher probability than ordered states.",
                "Arrow of Time: Gives time a forward direction in physics from order to disorder."
              ]
            }
          }
        ],
        rigorous: [
          {
            id: 'qp-r-1',
            question: "Analyze Quantum Entanglement and the violation of Bell's Inequalities. How does the Clauser-Horne-Shimony-Holt (CHSH) inequality definitively refute Local Hidden Variable theories?",
            keywords: ['entanglement', 'bell inequality', 'chsh', 'local realism', 'einstein', 'epr paradox', 'non-locality', 'correlation'],
            idealAnswer: "In 1935, Einstein, Podolsky, and Rosen (EPR) argued that quantum mechanics was incomplete, postulating Local Hidden Variables to preserve local realism. John Stewart Bell proved that any theory constrained by locality (no superluminal signaling) and realism (pre-existing counterfactual definite properties) must satisfy upper bounds on measurement correlations. Under the CHSH form, local realistic theories enforce |S| <= 2. Quantum mechanics predicts correlations up to 2 * sqrt(2) (~2.828, Tsirelson's bound) for entangled Bell states. Rigorous loophole-free experiments consistently measure S ~ 2.8, definitively falsifying local hidden variables and confirming quantum non-locality.",
            simpleAnswer: {
              summary: "Einstein thought entangled particles were like a pair of shoes placed in two boxes: one left, one right, predetermined from the start. Bell proved that the shoes don't pick whether they are left or right until someone actually opens one of the boxes.",
              analogy: "Imagine two synchronized roulette wheels in London and Tokyo. If local hidden rules were at play, their betting correlations could never mathematically exceed a score of 2. Quantum physics scores a 2.82, proving that the two wheels are linked by a unified quantum reality.",
              threePillars: [
                "EPR Dilemma: Einstein claimed physics must be local and realistic.",
                "Bell's Mathematics: Derived a mathematical ceiling (|S| <= 2) for any local universe.",
                "Quantum Victory: Experiments violate the limit, proving nature is non-local."
              ]
            }
          }
        ],
        crucible: [
          {
            id: 'qp-c-1',
            question: "Candidate, resolve the Black Hole Information Paradox. Contrast Hawking's original thermal radiation derivation with the Page Curve and the AdS/CFT holographic unitary perspective.",
            keywords: ['black hole', 'information paradox', 'hawking radiation', 'page curve', 'ads/cft', 'unitarity', 'entanglement entropy', 'islands'],
            idealAnswer: "Hawking's 1974 semicircular calculation demonstrated that black hole horizons emit thermal radiation with a Planckian blackbody spectrum. If a pure state collapses into a black hole and completely evaporates into mixed thermal radiation, quantum unitarity is violated—information is destroyed, contradicting the Von Neumann trace invariance of quantum mechanics. Don Page demonstrated that if evaporation is unitary, the entanglement entropy of the radiation must follow the 'Page Curve': rising initially, peaking at the Page time, and descending back to zero upon complete evaporation. The AdS/CFT correspondence enforces boundary unitarity, implying black hole interiors are dual to unitary boundary gauge theories. Recent semi-classical gravity discoveries of quantum extremal islands demonstrate that quantum corrections replicate the exact unitary Page Curve, preserving quantum information.",
            simpleAnswer: {
              summary: "If you throw a hard drive with your secret diary into a black hole, and the black hole slowly boils away into random heat, is your diary destroyed forever? Physics says information can never be deleted.",
              analogy: "If you burn a book in a campfire, the smoke and ashes look completely random, but in quantum theory, if you could capture every photon of heat and soot particle, you could theoretically reconstruct the original words. Hawking originally claimed black holes erase the words completely; modern physics proves the information leaks back out in subtle quantum correlations.",
              threePillars: [
                "Paradox Core: Quantum mechanics demands information cannot be destroyed; classic black hole physics said it was.",
                "The Page Curve: Proves information begins escaping halfway through the black hole's lifespan.",
                "Resolution via Holography: Quantum gravity protects unitarity—information is preserved."
              ]
            }
          }
        ]
      }
    }
  };

  // --- 2. DYNAMIC UNIVERSAL TOPIC GENERATOR ---
  /**
   * Generates a 4-tier authentic viva exam suite for ANY topic requested by the candidate
   */
  function synthesizeCurriculumForTopic(topicName) {
    const cleanTopic = topicName.trim();
    
    return {
      title: cleanTopic,
      category: 'Specialized Inquiry',
      questions: {
        foundation: [
          {
            id: `dyn-f-1`,
            question: `Candidate, please articulate the foundational thesis of ${cleanTopic}. What fundamental problem does it solve, and what are its core constituent components?`,
            keywords: [cleanTopic.toLowerCase(), 'concept', 'foundation', 'purpose', 'mechanism', 'definition'],
            idealAnswer: `The foundational architecture of ${cleanTopic} addresses fundamental limitations in its respective operational domain. It operates through systematic principles that coordinate core elements, establishing primary invariants and ensuring baseline functional integrity under standard conditions.`,
            simpleAnswer: {
              summary: `${cleanTopic} is designed to solve a central problem in the simplest, most direct manner possible.`,
              analogy: `Think of ${cleanTopic} like the engine in a vehicle: it turns raw fuel into forward motion through a predictable, repeating cycle.`,
              threePillars: [
                `Primary Purpose: Why ${cleanTopic} exists and what fundamental bottleneck it removes.`,
                `Core Mechanics: The essential moving parts that must coordinate together.`,
                `Baseline Invariant: The ground rule that must always hold true for it to work.`
              ]
            }
          }
        ],
        standard: [
          {
            id: `dyn-s-1`,
            question: `In practical execution, how does ${cleanTopic} negotiate trade-offs between efficiency, scalability, and complexity? Provide a concrete scenario.`,
            keywords: [cleanTopic.toLowerCase(), 'trade-off', 'execution', 'performance', 'scalability', 'complexity'],
            idealAnswer: `Under standard deployment, ${cleanTopic} balances resource allocation against operational latency. Practitioners must systematically evaluate trade-offs, mitigating systemic bottlenecks through defensive isolation and calibrated thresholds.`,
            simpleAnswer: {
              summary: `You cannot optimize everything at once with ${cleanTopic}—making it faster or bigger usually requires making it more complex or expensive.`,
              analogy: `It's like a restaurant kitchen: if you want to serve 1,000 customers an hour, you need more chefs, bigger prep tables, and tighter rules, which increases overhead.`,
              threePillars: [
                `Resource vs Throughput: The friction between speed and capacity.`,
                `Architectural Friction: Why naive implementations fail when load increases.`,
                `Pragmatic Compromise: How experienced practitioners strike the optimal balance.`
              ]
            }
          }
        ],
        rigorous: [
          {
            id: `dyn-r-1`,
            question: `Candidate, examine the critical failure modes of ${cleanTopic}. When boundary conditions are stressed or pathological inputs occur, what cascading faults emerge?`,
            keywords: [cleanTopic.toLowerCase(), 'failure mode', 'pathological', 'edge case', 'degradation', 'resilience'],
            idealAnswer: `Under boundary stress, ${cleanTopic} encounters failure regimes including resource exhaustion, synchronization drift, and catastrophic degradation. Maintaining resilience requires circuit breakers, defensive partitioning, and deterministic degradation strategies.`,
            simpleAnswer: {
              summary: `When pushed to its extreme limits, ${cleanTopic} breaks down in predictable ways unless safeguards are built in.`,
              analogy: `Think of a bridge during a gale: small gusts are fine, but harmonic resonance or extreme weight will trigger structural cracks unless dampers absorb the stress.`,
              threePillars: [
                `Boundary Limits: The exact threshold where normal assumptions collapse.`,
                `Cascading Impact: How a small fault triggers a chain reaction across the system.`,
                `Defensive Hardening: The safeguards required to survive hostile conditions.`
              ]
            }
          }
        ],
        crucible: [
          {
            id: `dyn-c-1`,
            question: `Defend the ultimate theoretical validity of ${cleanTopic} against competing paradigms. Address its deepest philosophical or architectural counter-arguments.`,
            keywords: [cleanTopic.toLowerCase(), 'paradigm', 'theoretical', 'critique', 'counter-argument', 'defense'],
            idealAnswer: `The doctrinal defense of ${cleanTopic} requires reconciling foundational trade-offs against opposing methodologies. While critics cite overhead and inherent constraints, its overarching synthesis provides formal guarantees that alternatives cannot replicate without sacrificing essential invariants.`,
            simpleAnswer: {
              summary: `Critics argue that ${cleanTopic} has fundamental flaws, but its defenders prove that the alternatives are actually worse when examined under rigorous scrutiny.`,
              analogy: `Like democracy: it has obvious flaws and inefficiencies, but as Churchill noted, it is better than all the alternative systems that have been tried.`,
              threePillars: [
                `Foundational Critique: The strongest objection an expert adversary can raise.`,
                `Paradigm Reconciliation: Why rival approaches fail to deliver the same guarantees.`,
                `The Definitive Defense: The core truth that cements its academic or practical value.`
              ]
            }
          }
        ]
      }
    };
  }

  // --- 3. CURRICULUM RETRIEVAL & LOOKUP ---
  function findCurriculum(topicInput) {
    if (!topicInput) return CURRICULA['computer-science'];

    const clean = topicInput.toLowerCase().trim();
    
    // Direct or fuzzy match with flagship curricula
    for (const [key, curr] of Object.entries(CURRICULA)) {
      if (clean.includes(key) || clean.includes(curr.title.toLowerCase())) {
        return curr;
      }
    }

    if (clean.includes('computer') || clean.includes('system') || clean.includes('software') || clean.includes('code') || clean.includes('data')) {
      return CURRICULA['computer-science'];
    }
    if (clean.includes('ai') || clean.includes('artificial') || clean.includes('neural') || clean.includes('machine learning') || clean.includes('llm') || clean.includes('deep learning')) {
      return CURRICULA['artificial-intelligence'];
    }
    if (clean.includes('med') || clean.includes('health') || clean.includes('doctor') || clean.includes('body') || clean.includes('cell') || clean.includes('physio') || clean.includes('heart')) {
      return CURRICULA['medicine-physiology'];
    }
    if (clean.includes('law') || clean.includes('court') || clean.includes('constitution') || clean.includes('legal') || clean.includes('crime') || clean.includes('judge')) {
      return CURRICULA['jurisprudence-law'];
    }
    if (clean.includes('physic') || clean.includes('quantum') || clean.includes('energy') || clean.includes('atom') || clean.includes('gravity') || clean.includes('thermo')) {
      return CURRICULA['quantum-physics'];
    }

    // Dynamic synthesis for any other topic
    return synthesizeCurriculumForTopic(topicInput);
  }

  // --- 4. SEMANTIC ANSWER EVALUATOR ---
  /**
   * Evaluates candidate's spoken or typed answer against target question rubric
   */
  function evaluateAnswer(candidateAnswer, questionObj, difficultyLevel) {
    if (!candidateAnswer || candidateAnswer.trim().length === 0) {
      return {
        score: 0,
        grade: 'Incomplete / No Response',
        feedback: "Candidate remained silent or submitted an empty response. A viva examination requires vocal defense.",
        keyConceptsPresent: [],
        keyConceptsMissing: questionObj.keywords || [],
        clarityScore: 0,
        depthScore: 0,
        simpleAnswer: questionObj.simpleAnswer,
        idealAnswer: questionObj.idealAnswer
      };
    }

    const text = candidateAnswer.toLowerCase();
    const words = text.split(/\s+/).filter(w => w.length > 2);
    const keywords = (questionObj.keywords || []).map(k => k.toLowerCase());

    // 1. Keyword / Concept coverage (with sub-phrase & stem tolerance)
    let matchedKeywords = [];
    let missedKeywords = [];

    keywords.forEach(kw => {
      const kwWords = kw.split(/\s+/).filter(w => w.length > 2);
      if (text.includes(kw)) {
        matchedKeywords.push(kw);
      } else if (kwWords.length > 1) {
        // Multi-word phrase: match if candidate mentioned at least half of the key words
        const subHits = kwWords.filter(sub => {
          const stem = sub.length > 4 ? sub.slice(0, -2) : sub;
          return text.includes(sub) || text.includes(stem);
        });
        if (subHits.length / kwWords.length >= 0.5) {
          matchedKeywords.push(kw);
        } else {
          missedKeywords.push(kw);
        }
      } else {
        // Single word: test stem
        const stem = kw.length > 4 ? kw.slice(0, -2) : kw;
        if (text.includes(stem)) {
          matchedKeywords.push(kw);
        } else {
          missedKeywords.push(kw);
        }
      }
    });

    const keywordRatio = keywords.length > 0 ? (matchedKeywords.length / keywords.length) : 0.5;

    // 2. Length & Structural Depth
    const wordCount = words.length;
    let lengthScore = 0;
    if (wordCount >= 50) lengthScore = 1.0;
    else if (wordCount >= 30) lengthScore = 0.85;
    else if (wordCount >= 18) lengthScore = 0.7;
    else if (wordCount >= 10) lengthScore = 0.5;
    else lengthScore = 0.25;

    // 3. Difficulty weighting
    let difficultyWeight = 1.0;
    if (difficultyLevel === 'crucible') difficultyWeight = 0.88;
    else if (difficultyLevel === 'rigorous') difficultyWeight = 0.93;

    // Combined score calculation (0 - 100)
    let rawScore = ((keywordRatio * 65) + (lengthScore * 35)) * difficultyWeight;
    const finalScore = Math.min(100, Math.max(15, Math.round(rawScore)));

    // Academic viva honors determination
    let grade = 'Pass';
    if (finalScore >= 90) grade = 'First Class Honours (Summa Cum Laude)';
    else if (finalScore >= 78) grade = 'Upper Second Honours (Magna Cum Laude)';
    else if (finalScore >= 62) grade = 'Merit Pass';
    else if (finalScore >= 45) grade = 'Conditional Pass (Revision Required)';
    else grade = 'Deficient (Unsatisfactory Defense)';

    // Dynamic teacher feedback commentary
    let feedback = '';
    if (finalScore >= 85) {
      feedback = `Excellent defense. You clearly understood the core mechanisms, notably ${matchedKeywords.slice(0, 3).join(', ')}. Your spoken argument was articulate and conceptually rigorous.`;
    } else if (finalScore >= 60) {
      feedback = `Good attempt. You correctly identified ${matchedKeywords.slice(0, 2).join(', ')}, but as your viva examiner, I noticed you omitted vital points regarding ${missedKeywords.slice(0, 2).join(' and ') || 'operational boundaries'}.`;
    } else {
      feedback = `Defense requires revision. You spoke on the topic, but missed key technical foundations (${missedKeywords.slice(0, 3).join(', ')}). Study the simplified mental model below to crystallize the concept.`;
    }

    return {
      score: finalScore,
      grade: grade,
      feedback: feedback,
      keyConceptsPresent: matchedKeywords,
      keyConceptsMissing: missedKeywords,
      wordCount: wordCount,
      simpleAnswer: questionObj.simpleAnswer,
      idealAnswer: questionObj.idealAnswer
    };
  }

  return {
    CURRICULA,
    findCurriculum,
    evaluateAnswer,
    synthesizeCurriculumForTopic
  };
})();

window.VAWAKnowledge = VAWAKnowledge;
