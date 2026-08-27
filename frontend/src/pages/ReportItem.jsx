import ReportForm from '../components/ReportForm'

function ReportItem() {
  return (
    <div className="report-page">
      <h1>Report an Item</h1>
      <p className="page-description">
        Found something or lost something? Fill out this form to help get it returned.
      </p>
      <ReportForm />
    </div>
  )
}

export default ReportItem
