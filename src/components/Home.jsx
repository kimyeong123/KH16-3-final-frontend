import Jumbotron from "./templates/Jumbotron.jsx";

export default function Home(){



    //render
    return(
        <>
        {/* <Jumbotron subject="KH 정보교육원 수업자료" detail="리액트 수업자료(Bootstrap 기반)"></Jumbotron> */}

 <Jumbotron subject="점보트론"
                  ></Jumbotron>
        {/* 화면에 표시할 주요 컨텐츠들(더미) */}
        {/* <!-- 주요 컨텐츠들 --> */}
	<div className="row mt-4">
		{/* <!-- 최근 게시글 --> */}
		<div className="col-md-6 mb-4 mt-5">
			<div className="d-flex justify-content-between">
				<h3>최근 게시글</h3>
				<a href="#"
					className="link-underline link-underline-opacity-0 text-info">더보기<i
					className="fa-solid fa-arrow-right"></i></a>
			</div>
			<hr></hr>
			<ul className="list-group list-group-flush">
				<li className="list-group-item text-truncate">첫 번째 게시글</li>
				<li className="list-group-item text-truncate">두 번째 게시글</li>
				<li className="list-group-item text-truncate">세 번째 게시글</li>
				<li className="list-group-item text-truncate">네 번째 게시글</li>
				<li className="list-group-item text-truncate">다섯 번째 게시글</li>
			</ul>
		</div>
		{/* <!-- 인기 게시글--> */}
		<div className="col-md-6 mb-4">
			<div className="d-flex justify-content-between">
				<h3>인기 게시글</h3>
				<a href="#"
					className="link-underline link-underline-opacity-0 text-info">더보기<i
					className="fa-solid fa-arrow-right"></i></a>
			</div>
			<hr></hr>
			<ul className="list-group list-group-flush">
				<li className="list-group-item text-truncate">어쩌구저쩌구...</li>
				<li className="list-group-item text-truncate">어쩌구저쩌구...</li>
				<li className="list-group-item text-truncate">어쩌구저쩌구...</li>
				<li className="list-group-item text-truncate">어쩌구저쩌구...</li>
				<li className="list-group-item text-truncate">어쩌구저쩌구...</li>
			</ul>
		</div>
		{/* <!-- 명예의 전당 --> */}
		<div className="col-md-6 mb-4">
			<div className="d-flex justify-content-between">
				<h3>명예의 전당</h3>
				<a href="#"
					className="link-underline link-underline-opacity-0 text-info">더보기<i
					className="fa-solid fa-arrow-right"></i></a>
			</div>
			<hr></hr>
			<ul className="list-group list-group-flush">
				<li className="list-group-item d-flex justify-content-between">
					<div>
						<span className="badge text-bg-primary">1</span> <span className="ms-4">피카츄</span>
					</div>
					<div>15,000 point</div>
				</li>
				<li className="list-group-item d-flex justify-content-between">
					<div>
						<span className="badge text-bg-secondary">2</span> <span className="ms-4">꼬부기</span>
					</div>
					<div>12,030 point</div>
				</li>
				<li className="list-group-item d-flex justify-content-between">
					<div>
						<span className="badge text-bg-secondary">3</span> <span className="ms-4">홍길동</span>
					</div>
					<div>11,077 point</div>
				</li>
				<li className="list-group-item d-flex justify-content-between">
					<div>
						<span className="badge text-bg-secondary">4</span> <span className="ms-4">닌자</span>
					</div>
					<div>8,560 point</div>
				</li>
				<li className="list-group-item d-flex justify-content-between">
					<div>
						<span className="badge text-bg-secondary">5</span> <span className="ms-4">사무라이</span>
					</div>
					<div>5,253 point</div>
				</li>
			</ul>
		</div>
		{/* <!-- 포켓몬 순위 --> */}
		<div className="col-md-6 mb-4">
			<div className="d-flex justify-content-between">
				<h3>포켓몬 랭킹</h3>
				<a href="#"
					className="link-underline link-underline-opacity-0 text-info">더보기<i
					className="fa-solid fa-arrow-right"></i></a>
			</div>
			<hr></hr>
			<ul className="list-group list-group-flush">
				<li className="list-group-item d-flex justify-content-between">
					<div className="text-start">
						<span className="badge text-bg-primary">1</span> <span className="ms-4">피카츄</span>
					</div>
					<div className="text-end">
						<i className="fa-solid fa-heart text-danger"></i> <span className="ms-1">702</span>
					</div>
				</li>
				<li className="list-group-item d-flex justify-content-between">
					<div className="text-start">
						<span className="badge text-bg-secondary">2</span> <span className="ms-4">라이츄</span>
					</div>
					<div className="text-end">
						<i className="fa-solid fa-heart text-danger"></i> <span className="ms-1">568</span>
					</div>
				</li>
				<li className="list-group-item d-flex justify-content-between">
					<div className="text-start">
						<span className="badge text-bg-secondary">3</span> <span className="ms-4">뮤츠</span>
					</div>
					<div className="text-end">
						<i className="fa-solid fa-heart text-danger"></i> <span className="ms-1">277</span>
					</div>
				</li>
				<li className="list-group-item d-flex justify-content-between">
					<div className="text-start">
						<span className="badge text-bg-secondary">4</span> <span className="ms-4">꼬부기</span>
					</div>
					<div className="text-end">
						<i className="fa-solid fa-heart text-danger"></i> <span className="ms-1">100</span>
					</div>
				</li>
				<li className="list-group-item d-flex justify-content-between">
					<div className="text-start">
						<span className="badge text-bg-secondary">5</span> <span className="ms-4">마자용</span>
					</div>
					<div className="tex t-end">
						<i className="fa-solid fa-heart text-danger"></i> <span className="ms-1">77</span>
					</div>
				</li>
			</ul>
		</div>
	</div>
        </>
    )
}