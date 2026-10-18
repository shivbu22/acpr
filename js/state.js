/**
 * ACPR Central State Store
 * Combines schemas from JSON Resume, RenderCV (YAML), LapisCV (Markdown), and Hugo Academic
 */

export const DEFAULT_PROFILE = {
  basics: {
    name: "Dr. Alex J. Rivera",
    label: "Staff AI Systems Engineer & Research Scientist",
    email: "alex.rivera@cs.stanford.edu",
    phone: "+1 (555) 382-9104",
    url: "https://alexrivera.dev",
    location: {
      city: "San Francisco, CA",
      country: "United States"
    },
    profiles: [
      { network: "GitHub", username: "alexrivera", url: "https://github.com/alexrivera" },
      { network: "LinkedIn", username: "alex-j-rivera", url: "https://linkedin.com/in/alex-j-rivera" },
      { network: "Google Scholar", username: "Alex J. Rivera", url: "https://scholar.google.com/citations?user=example" },
      { network: "ORCID", username: "0000-0002-1825-0097", url: "https://orcid.org/0000-0002-1825-0097" }
    ],
    summary: "Senior AI Systems Architect with 8+ years designing high-throughput distributed inference pipelines and LLM serving infrastructures. Co-author of 6 peer-reviewed papers on sparse attention and quantization algorithms. Proven track record leading cross-functional teams to scale mission-critical ML platforms serving 250M+ requests daily with sub-25ms latency."
  },
  experience: [
    {
      id: "exp-1",
      company: "Anthropic / Cognitive Systems Lab",
      position: "Lead Distributed Systems Architect",
      location: "San Francisco, CA",
      startDate: "2023-03",
      endDate: "Present",
      current: true,
      summary: "Directing the next-generation distributed inference engine and KV-cache optimization tier.",
      highlights: [
        "Architected custom continuous batching and PagedAttention scheduler reducing p99 inference latency by 42% across multi-cluster GPU deployments.",
        "Engineered zero-copy memory transport pipeline handling 250M+ requests/day, cutting cluster operational compute spend by $1.8M annually.",
        "Mentored a team of 12 distributed systems engineers and spearheaded RFC standards for real-time model streaming protocols."
      ]
    },
    {
      id: "exp-2",
      company: "Meta AI / FAIR Infrastructure",
      position: "Senior ML Infrastructure Engineer",
      location: "Menlo Park, CA",
      startDate: "2020-08",
      endDate: "2023-02",
      current: false,
      summary: "Scaled core PyTorch training pipelines and optimized high-performance distributed networking.",
      highlights: [
        "Implemented custom Triton and CUDA kernels for 4-bit quantization, unlocking 2.4x throughput boost on transformer attention blocks.",
        "Co-designed NCCL ring-allreduce network topology across 4,096 H100 GPUs, achieving 94.7% linear scaling efficiency.",
        "Integrated automated fault-tolerant checkpointing that reduced idle GPU restart recovery time from 18 minutes to under 45 seconds."
      ]
    },
    {
      id: "exp-3",
      company: "Google Cloud Platform",
      position: "Software Engineer (Distributed Storage)",
      location: "Mountain View, CA",
      startDate: "2018-06",
      endDate: "2020-07",
      current: false,
      summary: "Developed high-availability storage microservices and automated failover protocols.",
      highlights: [
        "Built distributed raft consensus monitor in Go and Rust processing 85,000 TPS with 99.999% SLA adherence.",
        "Designed real-time telemetry pipeline utilizing eBPF to trace kernel-level socket latency hotspots across internal microservices."
      ]
    }
  ],
  education: [
    {
      id: "edu-1",
      institution: "Stanford University",
      area: "Computer Science (Distributed Systems & AI)",
      studyType: "Ph.D.",
      startDate: "2014-09",
      endDate: "2018-06",
      score: "GPA: 3.96 / 4.0",
      courses: ["Advanced Distributed Computing", "Parallel Computer Architecture", "Neural Algorithmic Reasoning"]
    },
    {
      id: "edu-2",
      institution: "University of California, Berkeley",
      area: "Electrical Engineering & Computer Science (EECS)",
      studyType: "B.S. with Highest Honors",
      startDate: "2010-09",
      endDate: "2014-05",
      score: "GPA: 3.98 / 4.0",
      courses: ["Operating Systems & Compilers", "Computer Networks", "Algorithms & Complexity"]
    }
  ],
  skills: [
    {
      id: "skill-1",
      name: "Core Systems & Languages",
      keywords: ["Rust", "C++20", "Python", "CUDA", "Go", "TypeScript", "SQL"]
    },
    {
      id: "skill-2",
      name: "AI / ML & HPC Frameworks",
      keywords: ["PyTorch", "vLLM", "Triton", "TensorRT-LLM", "Hugging Face", "DeepSpeed", "Ray", "JAX"]
    },
    {
      id: "skill-3",
      name: "Cloud, Orchestration & DevOps",
      keywords: ["Kubernetes", "Docker", "eBPF", "Terraform", "Kafka", "Redis", "Prometheus", "Grafana"]
    },
    {
      id: "skill-4",
      name: "Architecture & Protocols",
      keywords: ["gRPC", "RDMA / RoCE", "Raft Consensus", "Microservices", "RESTful APIs", "GraphQL"]
    }
  ],
  projects: [
    {
      id: "proj-1",
      name: "FlashInfer-Rust",
      description: "High-performance modular Rust runtime for FlashAttention-3 kernel dispatching with zero runtime overhead.",
      url: "https://github.com/alexrivera/flashinfer-rust",
      githubUrl: "https://github.com/alexrivera/flashinfer-rust",
      keywords: ["Rust", "CUDA", "LLM Acceleration", "4.2k GitHub Stars"],
      highlights: [
        "Adopted by 18+ enterprise production pipelines for low-latency batch generation.",
        "Benchmarked 18% lower CPU scheduler overhead compared to native C++ bindings."
      ]
    },
    {
      id: "proj-2",
      name: "KubeLLM-Mesh",
      description: "Kubernetes operator for dynamic GPU memory tiering and autoscaling transformer inference topologies.",
      url: "https://kubellm-mesh.io",
      githubUrl: "https://github.com/alexrivera/kubellm-mesh",
      keywords: ["Go", "Kubernetes CRDs", "Distributed Systems"],
      highlights: [
        "Dynamically pools VRAM across nodes to enable distributed inference of 70B+ parameter models on commodity clusters."
      ]
    }
  ],
  publications: [
    {
      id: "pub-1",
      title: "Asynchronous KV-Cache Compression via Dynamic Speculative Decoding",
      authors: "A. J. Rivera, S. Chen, M. Zhang, E. Thorne",
      publisher: "NeurIPS 2024 (Oral Presentation)",
      releaseDate: "2024-12",
      url: "https://arxiv.org/abs/2410.99999",
      doi: "10.48550/arXiv.2410.99999",
      summary: "Pioneered a zero-regret speculative token caching mechanism that halves memory bandwidth saturation on long-context models."
    },
    {
      id: "pub-2",
      title: "Sub-Millisecond Fault Recovery in Massive GPU Clusters using RDMA Snapshots",
      authors: "A. J. Rivera, K. Patel, L. V. Berg",
      publisher: "USENIX OSDI 2022",
      releaseDate: "2022-07",
      url: "https://www.usenix.org/conference/osdi22/presentation/rivera",
      doi: "10.5555/osdi22.rivera",
      summary: "Demonstrated instant state replication across heterogeneous datacenter fabrics without checkpoint stalling."
    }
  ],
  certifications: [
    {
      id: "cert-1",
      name: "Certified Kubernetes Administrator (CKA)",
      issuer: "Cloud Native Computing Foundation (CNCF)",
      date: "2023"
    },
    {
      id: "cert-2",
      name: "AWS Certified Solutions Architect – Professional",
      issuer: "Amazon Web Services",
      date: "2022"
    }
  ],
  awards: [
    {
      id: "award-1",
      title: "Best Systems Paper Award",
      awarder: "USENIX Association",
      date: "2022",
      summary: "Awarded for groundbreaking work on asynchronous GPU memory checkpointing."
    },
    {
      id: "award-2",
      title: "Stanford Graduate Fellowship in Science & Engineering",
      awarder: "Stanford University",
      date: "2014"
    }
  ],
  sectionsOrder: ["experience", "projects", "education", "publications", "skills", "certifications", "awards"],
  sectionsVisibility: {
    experience: true,
    projects: true,
    education: true,
    publications: true,
    skills: true,
    certifications: true,
    awards: true
  },
  settings: {
    theme: "modern", // 'modern', 'classic', 'academic', 'minimal', 'creative'
    viewMode: "resume", // 'resume' | 'portfolio'
    primaryColor: "#0ea5e9",
    fontFamily: "Plus Jakarta Sans",
    fontSize: "9.5pt",
    lineHeight: "1.45",
    pageMargin: "14mm",
    paperSize: "a4",
    compactMode: false
  }
};

class StateManager {
  constructor() {
    this.state = this.loadState();
    this.listeners = [];
  }

  loadState() {
    try {
      const saved = localStorage.getItem("acpr_state_v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_PROFILE,
          ...parsed,
          basics: { ...DEFAULT_PROFILE.basics, ...(parsed.basics || {}) },
          settings: { ...DEFAULT_PROFILE.settings, ...(parsed.settings || {}) },
          sectionsVisibility: { ...DEFAULT_PROFILE.sectionsVisibility, ...(parsed.sectionsVisibility || {}) }
        };
      }
    } catch (e) {
      console.warn("Could not load from localStorage, falling back to default profile:", e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_PROFILE));
  }

  saveState() {
    try {
      localStorage.setItem("acpr_state_v1", JSON.stringify(this.state));
    } catch (e) {
      console.error("Failed to save state to localStorage:", e);
    }
  }

  getState() {
    return this.state;
  }

  updateState(updater) {
    if (typeof updater === "function") {
      updater(this.state);
    } else {
      this.state = { ...this.state, ...updater };
    }
    this.saveState();
    this.notify();
  }

  resetToDefault() {
    this.state = JSON.parse(JSON.stringify(DEFAULT_PROFILE));
    this.saveState();
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch (err) {
        console.error("State listener error:", err);
      }
    }
  }
}

export const stateManager = new StateManager();
